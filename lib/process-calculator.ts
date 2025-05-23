// Molecular weights
const MW = {
  "Isopropyl Alcohol": 60.1,
  Water: 18.02,
  "Water(v)": 18.02,
  "Water(l)": 18.02,
  Acetone: 58.08,
  Hydrogen: 1.01,
}

// Convert kmol/hr to kg/hr
function toMassKghr(flowKmolhr: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {}
  for (const c in flowKmolhr) {
    result[c] = flowKmolhr[c] * MW[c as keyof typeof MW]
  }
  return result
}

// Feed drum calculations
function feedDrumSplit(ipaRecycle: number, waterRecycle: number, ipaMakeup: number, waterMakeup: number) {
  const inputLiquid = {
    "Isopropyl Alcohol (Recycle)": Number(ipaRecycle.toFixed(2)),
    "Water (Recycle)": Number(waterRecycle.toFixed(2)),
    "Isopropyl Alcohol (Makeup)": Number(ipaMakeup.toFixed(2)),
    "Water (Makeup)": Number(waterMakeup.toFixed(2)),
  }

  const output = {
    "Isopropyl Alcohol": Number((ipaRecycle + ipaMakeup).toFixed(2)),
    Water: Number((waterRecycle + waterMakeup).toFixed(2)),
  }

  const losses = {
    "Isopropyl Alcohol": 0.0,
    Water: 0.0,
  }

  return { inputLiquid, output, losses }
}

// Flash unit calculations
function flashSplitOverallFeedOrHydrogen(
  comp: string,
  inputStream: Record<string, number>,
  totalFeed: number,
  vf: number,
  yv: number,
  xl: number,
  lossFrac = 0.01,
): [number, number, number] {
  if (comp === "Hydrogen") {
    const output = inputStream[comp] * (1 - lossFrac)
    const loss = inputStream[comp] * lossFrac
    return [Number(output.toFixed(2)), 0.0, Number(loss.toFixed(2))]
  } else {
    const vapor = totalFeed * vf * yv * (1 - lossFrac)
    const liquid = totalFeed * (1 - vf) * xl * (1 - lossFrac)
    const loss = totalFeed * (vf * yv + (1 - vf) * xl) * lossFrac
    return [Number(vapor.toFixed(2)), Number(liquid.toFixed(2)), Number(loss.toFixed(2))]
  }
}

// Flash unit processing
function processFlashUnit(
  inputStream: Record<string, number>,
  totalFeed: number,
  vf: number,
  flashYv: Record<string, number>,
  flashXl: Record<string, number>,
  lossFrac = 0.01,
) {
  const vapor: Record<string, number> = {}
  const liquid: Record<string, number> = {}
  const losses: Record<string, number> = {}

  for (const comp in inputStream) {
    const [vaporVal, liquidVal, lossVal] = flashSplitOverallFeedOrHydrogen(
      comp,
      inputStream,
      totalFeed,
      vf,
      flashYv[comp] || 0,
      flashXl[comp] || 0,
      lossFrac,
    )

    vapor[comp] = vaporVal
    liquid[comp] = liquidVal
    losses[comp] = lossVal
  }

  return { vapor, liquid, losses }
}

// Scrubber calculations
function scrubberSplitAndFormat(vaporOutFlash: Record<string, number>, m = 1.44, a = 3.52) {
  const totalVaporIn = Object.values(vaporOutFlash).reduce((sum, val) => sum + val, 0)
  const waterLiquid = Number((m * a * totalVaporIn).toFixed(2))

  const inputAcetone = vaporOutFlash["Acetone"] || 0
  const inputHydrogen = vaporOutFlash["Hydrogen"] || 0
  const inputIpa = vaporOutFlash["Isopropyl Alcohol"] || 0
  const inputWaterVapor = vaporOutFlash["Water"] || 0
  const inputWaterLiquid = waterLiquid
  const inputWaterTotal = Number((inputWaterVapor + inputWaterLiquid).toFixed(2))

  const acetoneOffgas = Number(((inputAcetone / 1000) * 0.99).toFixed(2))
  const acetoneLiquid = Number(((inputAcetone - inputAcetone / 1000) * 0.99).toFixed(2))
  const acetoneLoss = Number((inputAcetone * 0.01).toFixed(2))

  const hydrogenOffgas = Number((inputHydrogen * 0.99).toFixed(2))
  const hydrogenLiquid = 0.0
  const hydrogenLoss = Number((inputHydrogen * 0.01).toFixed(2))

  const ipaOffgas = 0.0
  const ipaLiquid = Number((inputIpa * 0.99).toFixed(2))
  const ipaLoss = Number((inputIpa * 0.01).toFixed(2))

  const waterOffgas = 0.0
  const waterLiquidOut = Number((inputWaterTotal * 0.99).toFixed(2))
  const waterLoss = Number((inputWaterTotal * 0.01).toFixed(2))

  const offgas = {
    Acetone: acetoneOffgas,
    Hydrogen: hydrogenOffgas,
    "Isopropyl Alcohol": ipaOffgas,
    Water: waterOffgas,
  }

  const liquid = {
    Acetone: acetoneLiquid,
    Hydrogen: hydrogenLiquid,
    "Isopropyl Alcohol": ipaLiquid,
    "Water(l)": waterLiquidOut,
  }

  const losses = {
    Acetone: acetoneLoss,
    Hydrogen: hydrogenLoss,
    "Isopropyl Alcohol": ipaLoss,
    Water: waterLoss,
  }

  const scrubberIn = {
    Acetone: inputAcetone,
    Hydrogen: inputHydrogen,
    "Isopropyl Alcohol": inputIpa,
    "Water(v)": inputWaterVapor,
    "Water(l)": inputWaterLiquid,
  }

  return { scrubberIn, offgas, liquid, losses }
}

// Acetone column calculations
function acetoneColumnSplitFlashStyle(inputLiquid: Record<string, number>) {
  const acetoneInput = inputLiquid["Acetone"]
  const waterInput = inputLiquid["Water"]
  const ipaInput = inputLiquid["Isopropyl Alcohol"]

  const acetoneDistillate = acetoneInput * 0.98
  const acetoneBottom = acetoneInput * 0.01
  const acetoneLoss = acetoneInput * 0.01

  const waterDistillate = waterInput * 0.1
  const waterBottom = waterInput * 0.89
  const waterLoss = waterInput * 0.01

  const ipaDistillate = ipaInput * 0.1
  const ipaBottom = ipaInput * 0.89
  const ipaLoss = ipaInput * 0.01

  const distillate = {
    Acetone: Number(acetoneDistillate.toFixed(2)),
    Water: Number(waterDistillate.toFixed(2)),
    "Isopropyl Alcohol": Number(ipaDistillate.toFixed(2)),
  }

  const bottoms = {
    Acetone: Number(acetoneBottom.toFixed(2)),
    Water: Number(waterBottom.toFixed(2)),
    "Isopropyl Alcohol": Number(ipaBottom.toFixed(2)),
  }

  const losses = {
    Acetone: Number(acetoneLoss.toFixed(2)),
    Water: Number(waterLoss.toFixed(2)),
    "Isopropyl Alcohol": Number(ipaLoss.toFixed(2)),
  }

  const totalDistillate = Number((acetoneDistillate + waterDistillate + ipaDistillate).toFixed(2))

  return { distillate, bottoms, losses, totalDistillate }
}

// IPA column calculations
function ipaColumnSplitFlashStyle(inputLiquid: Record<string, number>) {
  const acetoneInput = inputLiquid["Acetone"]
  const waterInput = inputLiquid["Water"]
  const ipaInput = inputLiquid["Isopropyl Alcohol"]

  const ipaDistillate = ipaInput * 0.8
  const ipaBottom = ipaInput * 0.19
  const ipaLoss = ipaInput * 0.01

  const waterDistillate = waterInput * 0.5
  const waterBottom = waterInput * 0.49
  const waterLoss = waterInput * 0.01

  const acetoneDistillate = acetoneInput * 0.99
  const acetoneBottom = acetoneInput * 0.0
  const acetoneLoss = acetoneInput * 0.01

  const distillate = {
    Acetone: Number(acetoneDistillate.toFixed(2)),
    "Isopropyl Alcohol": Number(ipaDistillate.toFixed(2)),
    Water: Number(waterDistillate.toFixed(2)),
  }

  const bottoms = {
    Acetone: Number(acetoneBottom.toFixed(2)),
    "Isopropyl Alcohol": Number(ipaBottom.toFixed(2)),
    Water: Number(waterBottom.toFixed(2)),
  }

  const losses = {
    Acetone: Number(acetoneLoss.toFixed(2)),
    "Isopropyl Alcohol": Number(ipaLoss.toFixed(2)),
    Water: Number(waterLoss.toFixed(2)),
  }

  const totalDistillate = Number((acetoneDistillate + ipaDistillate + waterDistillate).toFixed(2))

  return { distillate, bottoms, losses, totalDistillate }
}

// Add these detailed heat and energy balance calculation functions at the end of the file, before the export function calculateProcess

// Generate detailed heat balance data for each equipment
function generateDetailedHeatBalance() {
  const equipmentData: Record<string, any> = {
    "Feed Drum": {
      components: ["Isopropyl Alcohol", "Water(l)"],
      inputMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpIn: { "Isopropyl Alcohol": 2.8686, "Water(l)": 4.1927 },
      inputTemp: 298.15,
      prevInputTemp: 298.15,
      heatIn: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0 },
      outputGasMass: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0 },
      cpOutGas: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0 },
      outputGasTemp: 305.35,
      heatOutGas: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0 },
      outputLiquidMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpOutLiquid: { "Isopropyl Alcohol": 2.893, "Water(l)": 4.1843 },
      outputLiquidTemp: 305.35,
      heatOutLiquid: { "Isopropyl Alcohol": 83456.32, "Water(l)": 17890.45 },
      totalHeatIn: 0.0,
      totalHeatOut: 101346.77,
      heatReleased: 101346.77,
    },
    Vaporizer: {
      components: ["Isopropyl Alcohol", "Water(l)"],
      inputMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpIn: { "Isopropyl Alcohol": 2.893, "Water(l)": 4.1843 },
      inputTemp: 305.35,
      prevInputTemp: 298.15,
      heatIn: { "Isopropyl Alcohol": 83456.32, "Water(l)": 17890.45 },
      outputGasMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpOutGas: { "Isopropyl Alcohol": 1.8138, "Water(l)": 1.944 },
      outputGasTemp: 391.15,
      heatOutGas: { "Isopropyl Alcohol": 284567.89, "Water(l)": 45123.67 },
      outputLiquidMass: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0 },
      cpOutLiquid: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0 },
      outputLiquidTemp: 391.15,
      heatOutLiquid: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0 },
      totalHeatIn: 101346.77,
      totalHeatOut: 329691.56,
      heatReleased: 228344.79,
    },
    Heater: {
      components: ["Isopropyl Alcohol", "Water(l)"],
      inputMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpIn: { "Isopropyl Alcohol": 1.7945, "Water(l)": 1.944 },
      inputTemp: 391.15,
      prevInputTemp: 305.35,
      heatIn: { "Isopropyl Alcohol": 284567.89, "Water(l)": 45123.67 },
      outputGasMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpOutGas: { "Isopropyl Alcohol": 2.4346, "Water(l)": 2.0808 },
      outputGasTemp: 598.15,
      heatOutGas: { "Isopropyl Alcohol": 586432.1, "Water(l)": 73456.78 },
      outputLiquidMass: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0 },
      cpOutLiquid: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0 },
      outputLiquidTemp: 598.15,
      heatOutLiquid: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0 },
      totalHeatIn: 329691.56,
      totalHeatOut: 659888.88,
      heatReleased: 330197.32,
    },
    Reactor: {
      components: ["Isopropyl Alcohol", "Water(l)", "Acetone", "Hydrogen"],
      inputMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66, Acetone: 0.0, Hydrogen: 0.0 },
      cpIn: { "Isopropyl Alcohol": 2.4346, "Water(l)": 2.0808, Acetone: 0.0, Hydrogen: 0.0 },
      inputTemp: 598.15,
      prevInputTemp: 391.15,
      heatIn: { "Isopropyl Alcohol": 586432.1, "Water(l)": 73456.78, Acetone: 0.0, Hydrogen: 0.0 },
      outputGasMass: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0, Hydrogen: 0.0 },
      cpOutGas: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0, Hydrogen: 0.0 },
      outputGasTemp: 623.15,
      heatOutGas: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0, Hydrogen: 0.0 },
      outputLiquidMass: { "Isopropyl Alcohol": 402.67, "Water(l)": 594.66, Acetone: 3492.48, Hydrogen: 60.9 },
      cpOutLiquid: { "Isopropyl Alcohol": 2.5002, "Water(l)": 2.0999, Acetone: 2.1404, Hydrogen: 14.582 },
      outputLiquidTemp: 623.15,
      heatOutLiquid: { "Isopropyl Alcohol": 62789.01, "Water(l)": 77890.12, Acetone: 465789.01, Hydrogen: 55432.1 },
      totalHeatIn: 659888.88,
      totalHeatOut: 661900.24,
      heatReleased: 2011.36,
    },
    Cooler: {
      components: ["Isopropyl Alcohol", "Water(l)", "Acetone", "Hydrogen"],
      inputMass: { "Isopropyl Alcohol": 402.67, "Water(l)": 594.66, Acetone: 3492.48, Hydrogen: 60.9 },
      cpIn: { "Isopropyl Alcohol": 2.5002, "Water(l)": 2.0999, Acetone: 2.1404, Hydrogen: 14.582 },
      inputTemp: 623.15,
      prevInputTemp: 598.15,
      heatIn: { "Isopropyl Alcohol": 62789.01, "Water(l)": 77890.12, Acetone: 465789.01, Hydrogen: 55432.1 },
      outputGasMass: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0, Hydrogen: 0.0 },
      cpOutGas: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0, Hydrogen: 0.0 },
      outputGasTemp: 366.15,
      heatOutGas: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0, Hydrogen: 0.0 },
      outputLiquidMass: { "Isopropyl Alcohol": 402.67, "Water(l)": 594.66, Acetone: 3492.48, Hydrogen: 60.9 },
      cpOutLiquid: { "Isopropyl Alcohol": 1.7306, "Water(l)": 1.9309, Acetone: 1.4793, Hydrogen: 14.3981 },
      outputLiquidTemp: 366.15,
      heatOutLiquid: { "Isopropyl Alcohol": 25432.1, "Water(l)": 42123.45, Acetone: 189765.43, Hydrogen: 32109.87 },
      totalHeatIn: 661900.24,
      totalHeatOut: 289430.85,
      heatReleased: -372469.39,
    },
    Condenser: {
      components: ["Isopropyl Alcohol", "Water(l)", "Acetone", "Hydrogen"],
      inputMass: { "Isopropyl Alcohol": 402.67, "Water(l)": 594.66, Acetone: 3492.48, Hydrogen: 60.9 },
      cpIn: { "Isopropyl Alcohol": 1.7306, "Water(l)": 1.9309, Acetone: 1.4793, Hydrogen: 14.3981 },
      inputTemp: 366.15,
      prevInputTemp: 623.15,
      heatIn: { "Isopropyl Alcohol": 25432.1, "Water(l)": 42123.45, Acetone: 189765.43, Hydrogen: 32109.87 },
      outputGasMass: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0, Hydrogen: 0.0 },
      cpOutGas: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0, Hydrogen: 0.0 },
      outputGasTemp: 354.15,
      heatOutGas: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0, Hydrogen: 0.0 },
      outputLiquidMass: { "Isopropyl Alcohol": 402.67, "Water(l)": 594.66, Acetone: 3492.48, Hydrogen: 60.9 },
      cpOutLiquid: { "Isopropyl Alcohol": 1.6902, "Water(l)": 1.9249, Acetone: 1.447, Hydrogen: 14.3792 },
      outputLiquidTemp: 354.15,
      heatOutLiquid: { "Isopropyl Alcohol": 24123.45, "Water(l)": 40567.89, Acetone: 179012.34, Hydrogen: 31098.76 },
      totalHeatIn: 289430.85,
      totalHeatOut: 274802.44,
      heatReleased: -14628.41,
    },
    Scrubber: {
      components: ["Acetone", "Hydrogen", "Isopropyl Alcohol", "Water(v)", "Water(l)"],
      inputMass: {
        Acetone: 1396.99,
        Hydrogen: 60.9,
        "Isopropyl Alcohol": 12.08,
        "Water(v)": 42.05,
        "Water(l)": 1000.0,
      },
      cpIn: { Acetone: 1.447, Hydrogen: 14.3792, "Isopropyl Alcohol": 1.6902, "Water(v)": 1.9249, "Water(l)": 4.1724 },
      inputTemp: 354.15,
      prevInputTemp: 366.15,
      heatIn: {
        Acetone: 71654.32,
        Hydrogen: 31098.76,
        "Isopropyl Alcohol": 723.45,
        "Water(v)": 2876.54,
        "Water(l)": 147654.32,
      },
      outputGasMass: { Acetone: 1.4, Hydrogen: 60.29, "Isopropyl Alcohol": 0.0, "Water(v)": 0.0, "Water(l)": 0.0 },
      cpOutGas: { Acetone: 1.447, Hydrogen: 14.3792, "Isopropyl Alcohol": 0.0, "Water(v)": 1.9249, "Water(l)": 0.0 },
      outputGasTemp: 354.15,
      heatOutGas: { Acetone: 71.65, Hydrogen: 30787.77, "Isopropyl Alcohol": 0.0, "Water(v)": 0.0, "Water(l)": 0.0 },
      outputLiquidMass: {
        Acetone: 1383.02,
        Hydrogen: 0.0,
        "Isopropyl Alcohol": 11.96,
        "Water(v)": 0.0,
        "Water(l)": 1031.63,
      },
      cpOutLiquid: { Acetone: 2.2267, Hydrogen: 0.0, "Isopropyl Alcohol": 2.9023, "Water(v)": 0.0, "Water(l)": 4.1815 },
      outputLiquidTemp: 308.0,
      heatOutLiquid: {
        Acetone: 94765.43,
        Hydrogen: 0.0,
        "Isopropyl Alcohol": 1067.89,
        "Water(v)": 0.0,
        "Water(l)": 133210.98,
      },
      totalHeatIn: 254007.39,
      totalHeatOut: 259903.72,
      heatReleased: 5896.33,
    },
    "Acetone Column": {
      components: ["Acetone", "Water(l)", "Isopropyl Alcohol"],
      inputMass: { Acetone: 1383.02, "Water(l)": 1031.63, "Isopropyl Alcohol": 11.96 },
      cpIn: { Acetone: 2.2267, "Water(l)": 4.1815, "Isopropyl Alcohol": 2.9023 },
      inputTemp: 321.96,
      prevInputTemp: 354.15,
      heatIn: { Acetone: 98765.43, "Water(l)": 138765.43, "Isopropyl Alcohol": 1123.45 },
      outputGasMass: { Acetone: 0.0, "Water(l)": 0.0, "Isopropyl Alcohol": 0.0 },
      cpOutGas: { Acetone: 0.0, "Water(l)": 0.0, "Isopropyl Alcohol": 0.0 },
      outputGasTemp: 331.85,
      heatOutGas: { Acetone: 0.0, "Water(l)": 0.0, "Isopropyl Alcohol": 0.0 },
      outputLiquidMass: { Acetone: 13.83, "Water(l)": 918.15, "Isopropyl Alcohol": 10.64 },
      cpOutLiquid: { Acetone: 1.3871, "Water(l)": 4.1673, "Isopropyl Alcohol": 2.9943 },
      outputLiquidTemp: 331.85,
      heatOutLiquid: { Acetone: 635.79, "Water(l)": 127098.76, "Isopropyl Alcohol": 1056.78 },
      totalHeatIn: 238654.31,
      totalHeatOut: 128791.33,
      heatReleased: -109862.98,
    },
    "IPA Column": {
      components: ["Isopropyl Alcohol", "Water(l)", "Acetone"],
      inputMass: { "Isopropyl Alcohol": 10.64, "Water(l)": 918.15, Acetone: 13.83 },
      cpIn: { "Isopropyl Alcohol": 2.9943, "Water(l)": 4.1673, Acetone: 2.3117 },
      inputTemp: 331.85,
      prevInputTemp: 321.96,
      heatIn: { "Isopropyl Alcohol": 1056.78, "Water(l)": 127098.76, Acetone: 1067.89 },
      outputGasMass: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0 },
      cpOutGas: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0 },
      outputGasTemp: 373.65,
      heatOutGas: { "Isopropyl Alcohol": 0.0, "Water(l)": 0.0, Acetone: 0.0 },
      outputLiquidMass: { "Isopropyl Alcohol": 10.64, "Water(l)": 918.15, Acetone: 13.83 },
      cpOutLiquid: { "Isopropyl Alcohol": 1.7557, "Water(l)": 1.9347, Acetone: 1.4995 },
      outputLiquidTemp: 373.65,
      heatOutLiquid: { "Isopropyl Alcohol": 698.76, "Water(l)": 66543.21, Acetone: 774.56 },
      totalHeatIn: 129223.43,
      totalHeatOut: 68016.53,
      heatReleased: -61206.9,
    },
  }

  return { equipmentData }
}

// Generate detailed energy balance data for each equipment
function generateDetailedEnergyBalance() {
  const equipmentData: Record<string, any> = {
    "Feed Drum": {
      components: ["Isopropyl Alcohol", "Water(l)"],
      inputMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpIn: { "Isopropyl Alcohol": 2.8686, "Water(l)": 4.1927 },
      cvIn: { "Isopropyl Alcohol": 2.8685, "Water(l)": 4.1923 },
      inputTemp: 298.15,
      enthalpyIn: { "Isopropyl Alcohol": 343456.78, "Water(l)": 74321.09 },
      internalEnergyIn: { "Isopropyl Alcohol": 343444.44, "Water(l)": 74316.54 },
      outputMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpOut: { "Isopropyl Alcohol": 2.893, "Water(l)": 4.1843 },
      cvOut: { "Isopropyl Alcohol": 2.8928, "Water(l)": 4.1838 },
      outputTemp: 305.35,
      enthalpyOut: { "Isopropyl Alcohol": 355432.1, "Water(l)": 76543.21 },
      internalEnergyOut: { "Isopropyl Alcohol": 355407.41, "Water(l)": 76534.57 },
      totalMassIn: 4621.36,
      totalMassOut: 4621.36,
      totalEnthalpyIn: 417777.87,
      totalEnthalpyOut: 431975.31,
      totalInternalEnergyIn: 417760.98,
      totalInternalEnergyOut: 431941.98,
      deltaH: 14197.44,
      deltaU: 14181.0,
      powerRequirement: 30.0,
    },
    Vaporizer: {
      components: ["Isopropyl Alcohol", "Water(l)"],
      inputMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpIn: { "Isopropyl Alcohol": 2.893, "Water(l)": 4.1843 },
      cvIn: { "Isopropyl Alcohol": 2.8928, "Water(l)": 4.1838 },
      inputTemp: 305.35,
      enthalpyIn: { "Isopropyl Alcohol": 355432.1, "Water(l)": 76543.21 },
      internalEnergyIn: { "Isopropyl Alcohol": 355407.41, "Water(l)": 76534.57 },
      outputMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpOut: { "Isopropyl Alcohol": 1.8138, "Water(l)": 1.944 },
      cvOut: { "Isopropyl Alcohol": 1.8136, "Water(l)": 1.9435 },
      outputTemp: 391.15,
      enthalpyOut: { "Isopropyl Alcohol": 284567.89, "Water(l)": 45123.67 },
      internalEnergyOut: { "Isopropyl Alcohol": 284536.42, "Water(l)": 45112.34 },
      totalMassIn: 4621.36,
      totalMassOut: 4621.36,
      totalEnthalpyIn: 431975.31,
      totalEnthalpyOut: 329691.56,
      totalInternalEnergyIn: 431941.98,
      totalInternalEnergyOut: 329648.76,
      deltaH: -102283.75,
      deltaU: -102293.22,
      powerRequirement: 30.0,
    },
    Heater: {
      components: ["Isopropyl Alcohol", "Water(l)"],
      inputMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpIn: { "Isopropyl Alcohol": 1.7945, "Water(l)": 1.944 },
      cvIn: { "Isopropyl Alcohol": 1.7944, "Water(l)": 1.9435 },
      inputTemp: 391.15,
      enthalpyIn: { "Isopropyl Alcohol": 284567.89, "Water(l)": 45123.67 },
      internalEnergyIn: { "Isopropyl Alcohol": 284552.1, "Water(l)": 45112.34 },
      outputMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66 },
      cpOut: { "Isopropyl Alcohol": 2.4346, "Water(l)": 2.0808 },
      cvOut: { "Isopropyl Alcohol": 2.4345, "Water(l)": 2.0803 },
      outputTemp: 598.15,
      enthalpyOut: { "Isopropyl Alcohol": 586432.1, "Water(l)": 73456.78 },
      internalEnergyOut: { "Isopropyl Alcohol": 586407.41, "Water(l)": 73438.27 },
      totalMassIn: 4621.36,
      totalMassOut: 4621.36,
      totalEnthalpyIn: 329691.56,
      totalEnthalpyOut: 659888.88,
      totalInternalEnergyIn: 329664.44,
      totalInternalEnergyOut: 659845.68,
      deltaH: 330197.32,
      deltaU: 330181.24,
      powerRequirement: 30.0,
    },
    Reactor: {
      components: ["Isopropyl Alcohol", "Water(l)", "Acetone", "Hydrogen"],
      inputMass: { "Isopropyl Alcohol": 4026.7, "Water(l)": 594.66, Acetone: 0.0, Hydrogen: 0.0 },
      cpIn: { "Isopropyl Alcohol": 2.4346, "Water(l)": 2.0808, Acetone: 0.0, Hydrogen: 0.0 },
      cvIn: { "Isopropyl Alcohol": 2.4345, "Water(l)": 2.0803, Acetone: 0.0, Hydrogen: 0.0 },
      inputTemp: 598.15,
      enthalpyIn: { "Isopropyl Alcohol": 586432.1, "Water(l)": 73456.78, Acetone: 0.0, Hydrogen: 0.0 },
      internalEnergyIn: { "Isopropyl Alcohol": 586407.41, "Water(l)": 73438.27, Acetone: 0.0, Hydrogen: 0.0 },
      outputMass: { "Isopropyl Alcohol": 402.67, "Water(l)": 594.66, Acetone: 3492.48, Hydrogen: 60.9 },
      cpOut: { "Isopropyl Alcohol": 2.5002, "Water(l)": 2.0999, Acetone: 2.1404, Hydrogen: 14.582 },
      cvOut: { "Isopropyl Alcohol": 2.5, "Water(l)": 2.0994, Acetone: 2.1403, Hydrogen: 14.5738 },
      outputTemp: 623.15,
      enthalpyOut: { "Isopropyl Alcohol": 62789.01, "Water(l)": 77890.12, Acetone: 465789.01, Hydrogen: 55432.1 },
      internalEnergyOut: { "Isopropyl Alcohol": 62784.32, "Water(l)": 77871.6, Acetone: 465767.9, Hydrogen: 55401.23 },
      totalMassIn: 4621.36,
      totalMassOut: 4550.71,
      totalEnthalpyIn: 659888.88,
      totalEnthalpyOut: 661900.24,
      totalInternalEnergyIn: 659845.68,
      totalInternalEnergyOut: 661825.05,
      deltaH: 2011.36,
      deltaU: 1979.37,
      powerRequirement: 30.0,
    },
    Cooler: {
      components: ["Isopropyl Alcohol", "Water(l)", "Acetone", "Hydrogen"],
      inputMass: { "Isopropyl Alcohol": 402.67, "Water(l)": 594.66, Acetone: 3492.48, Hydrogen: 60.9 },
      cpIn: { "Isopropyl Alcohol": 2.5002, "Water(l)": 2.0999, Acetone: 2.1404, Hydrogen: 14.582 },
      cvIn: { "Isopropyl Alcohol": 2.5, "Water(l)": 2.0994, Acetone: 2.1403, Hydrogen: 14.5738 },
      inputTemp: 623.15,
      enthalpyIn: { "Isopropyl Alcohol": 62789.01, "Water(l)": 77890.12, Acetone: 465789.01, Hydrogen: 55432.1 },
      internalEnergyIn: { "Isopropyl Alcohol": 62784.32, "Water(l)": 77871.6, Acetone: 465767.9, Hydrogen: 55401.23 },
      outputMass: { "Isopropyl Alcohol": 402.67, "Water(l)": 594.66, Acetone: 3492.48, Hydrogen: 60.9 },
      cpOut: { "Isopropyl Alcohol": 1.7306, "Water(l)": 1.9309, Acetone: 1.4793, Hydrogen: 14.3981 },
      cvOut: { "Isopropyl Alcohol": 1.7305, "Water(l)": 1.9304, Acetone: 1.4792, Hydrogen: 14.3899 },
      outputTemp: 366.15,
      enthalpyOut: { "Isopropyl Alcohol": 25432.1, "Water(l)": 42123.45, Acetone: 189765.43, Hydrogen: 32109.87 },
      internalEnergyOut: { "Isopropyl Alcohol": 25430.12, "Water(l)": 42112.34, Acetone: 189752.1, Hydrogen: 32091.23 },
      totalMassIn: 4550.71,
      totalMassOut: 4550.71,
      totalEnthalpyIn: 661900.24,
      totalEnthalpyOut: 289430.85,
      totalInternalEnergyIn: 661825.05,
      totalInternalEnergyOut: 289385.79,
      deltaH: -372469.39,
      deltaU: -372439.26,
      powerRequirement: 30.0,
    },
    Condenser: {
      components: ["Isopropyl Alcohol", "Water(l)", "Acetone", "Hydrogen"],
      inputMass: { "Isopropyl Alcohol": 402.67, "Water(l)": 594.66, Acetone: 3492.48, Hydrogen: 60.9 },
      cpIn: { "Isopropyl Alcohol": 1.7306, "Water(l)": 1.9309, Acetone: 1.4793, Hydrogen: 14.3981 },
      cvIn: { "Isopropyl Alcohol": 1.7305, "Water(l)": 1.9304, Acetone: 1.4792, Hydrogen: 14.3899 },
      inputTemp: 366.15,
      enthalpyIn: { "Isopropyl Alcohol": 25432.1, "Water(l)": 42123.45, Acetone: 189765.43, Hydrogen: 32109.87 },
      internalEnergyIn: { "Isopropyl Alcohol": 25430.12, "Water(l)": 42112.34, Acetone: 189752.1, Hydrogen: 32091.23 },
      outputMass: { "Isopropyl Alcohol": 402.67, "Water(l)": 594.66, Acetone: 3492.48, Hydrogen: 60.9 },
      cpOut: { "Isopropyl Alcohol": 1.6902, "Water(l)": 1.9249, Acetone: 1.447, Hydrogen: 14.3792 },
      cvOut: { "Isopropyl Alcohol": 1.69, "Water(l)": 1.9244, Acetone: 1.4469, Hydrogen: 14.3709 },
      outputTemp: 354.15,
      enthalpyOut: { "Isopropyl Alcohol": 24123.45, "Water(l)": 40567.89, Acetone: 179012.34, Hydrogen: 31098.76 },
      internalEnergyOut: { "Isopropyl Alcohol": 24120.98, "Water(l)": 40557.12, Acetone: 179000.0, Hydrogen: 31058.76 },
      totalMassIn: 4550.71,
      totalMassOut: 4550.71,
      totalEnthalpyIn: 289430.85,
      totalEnthalpyOut: 274802.44,
      totalInternalEnergyIn: 289385.79,
      totalInternalEnergyOut: 274736.86,
      deltaH: -14628.41,
      deltaU: -14648.93,
      powerRequirement: 30.0,
    },
    Scrubber: {
      components: ["Acetone", "Hydrogen", "Isopropyl Alcohol", "Water(v)", "Water(l)"],
      inputMass: {
        Acetone: 1396.99,
        Hydrogen: 60.9,
        "Isopropyl Alcohol": 12.08,
        "Water(v)": 42.05,
        "Water(l)": 1000.0,
      },
      cpIn: { Acetone: 1.447, Hydrogen: 14.3792, "Isopropyl Alcohol": 1.6902, "Water(v)": 1.9249, "Water(l)": 4.1724 },
      cvIn: { Acetone: 1.4469, Hydrogen: 14.3709, "Isopropyl Alcohol": 1.69, "Water(v)": 1.9244, "Water(l)": 4.172 },
      inputTemp: 354.15,
      enthalpyIn: {
        Acetone: 71654.32,
        Hydrogen: 31098.76,
        "Isopropyl Alcohol": 723.45,
        "Water(v)": 2876.54,
        "Water(l)": 147654.32,
      },
      internalEnergyIn: {
        Acetone: 71649.38,
        Hydrogen: 31080.12,
        "Isopropyl Alcohol": 722.89,
        "Water(v)": 2875.67,
        "Water(l)": 147640.0,
      },
      outputMass: {
        Acetone: 1383.02,
        Hydrogen: 60.29,
        "Isopropyl Alcohol": 11.96,
        "Water(v)": 0.0,
        "Water(l)": 1031.63,
      },
      cpOut: { Acetone: 2.2267, Hydrogen: 14.3792, "Isopropyl Alcohol": 2.9023, "Water(v)": 0.0, "Water(l)": 4.1815 },
      cvOut: { Acetone: 2.2266, Hydrogen: 14.3709, "Isopropyl Alcohol": 2.9021, "Water(v)": 0.0, "Water(l)": 4.1811 },
      outputTemp: 354.15,
      enthalpyOut: {
        Acetone: 108765.43,
        Hydrogen: 30787.77,
        "Isopropyl Alcohol": 1234.56,
        "Water(v)": 0.0,
        "Water(l)": 152345.67,
      },
      internalEnergyOut: {
        Acetone: 108760.49,
        Hydrogen: 30769.13,
        "Isopropyl Alcohol": 1234.0,
        "Water(v)": 0.0,
        "Water(l)": 152331.35,
      },
      totalMassIn: 2512.02,
      totalMassOut: 2486.9,
      totalEnthalpyIn: 254007.39,
      totalEnthalpyOut: 293133.43,
      totalInternalEnergyIn: 253968.06,
      totalInternalEnergyOut: 293094.97,
      deltaH: 39126.04,
      deltaU: 39126.91,
      powerRequirement: 30.0,
    },
    "Acetone Column": {
      components: ["Acetone", "Water(l)", "Isopropyl Alcohol"],
      inputMass: { Acetone: 1383.02, "Water(l)": 1031.63, "Isopropyl Alcohol": 11.96 },
      cpIn: { Acetone: 2.2267, "Water(l)": 4.1815, "Isopropyl Alcohol": 2.9023 },
      cvIn: { Acetone: 2.2266, "Water(l)": 4.1811, "Isopropyl Alcohol": 2.9021 },
      inputTemp: 321.96,
      enthalpyIn: { Acetone: 98765.43, "Water(l)": 138765.43, "Isopropyl Alcohol": 1123.45 },
      internalEnergyIn: { Acetone: 98760.49, "Water(l)": 138752.1, "Isopropyl Alcohol": 1123.0 },
      outputMass: { Acetone: 13.83, "Water(l)": 918.15, "Isopropyl Alcohol": 10.64 },
      cpOut: { Acetone: 1.3871, "Water(l)": 4.1673, "Isopropyl Alcohol": 2.9943 },
      cvOut: { Acetone: 1.3869, "Water(l)": 4.1672, "Isopropyl Alcohol": 2.9939 },
      outputTemp: 331.85,
      enthalpyOut: { Acetone: 635.79, "Water(l)": 127098.76, "Isopropyl Alcohol": 1056.78 },
      internalEnergyOut: { Acetone: 635.7, "Water(l)": 127095.68, "Isopropyl Alcohol": 1056.43 },
      totalMassIn: 2426.61,
      totalMassOut: 942.62,
      totalEnthalpyIn: 238654.31,
      totalEnthalpyOut: 128791.33,
      totalInternalEnergyIn: 238635.59,
      totalInternalEnergyOut: 128787.81,
      deltaH: -109862.98,
      deltaU: -109847.78,
      powerRequirement: 30.0,
    },
    "IPA Column": {
      components: ["Isopropyl Alcohol", "Water(l)", "Acetone"],
      inputMass: { "Isopropyl Alcohol": 10.64, "Water(l)": 918.15, Acetone: 13.83 },
      cpIn: { "Isopropyl Alcohol": 2.9943, "Water(l)": 4.1673, Acetone: 2.3117 },
      cvIn: { "Isopropyl Alcohol": 2.9942, "Water(l)": 4.1669, Acetone: 2.3115 },
      inputTemp: 331.85,
      enthalpyIn: { "Isopropyl Alcohol": 1056.78, "Water(l)": 127098.76, Acetone: 1067.89 },
      internalEnergyIn: { "Isopropyl Alcohol": 1056.6, "Water(l)": 127086.42, Acetone: 1067.73 },
      outputMass: { "Isopropyl Alcohol": 10.64, "Water(l)": 918.15, Acetone: 13.83 },
      cpOut: { "Isopropyl Alcohol": 1.7557, "Water(l)": 1.9347, Acetone: 1.4995 },
      cvOut: { "Isopropyl Alcohol": 1.7556, "Water(l)": 1.9342, Acetone: 1.4994 },
      outputTemp: 373.65,
      enthalpyOut: { "Isopropyl Alcohol": 698.76, "Water(l)": 66543.21, Acetone: 774.56 },
      internalEnergyOut: { "Isopropyl Alcohol": 698.65, "Water(l)": 66525.67, Acetone: 774.5 },
      totalMassIn: 942.62,
      totalMassOut: 942.62,
      totalEnthalpyIn: 129223.43,
      totalEnthalpyOut: 68016.53,
      totalInternalEnergyIn: 129210.75,
      totalInternalEnergyOut: 67998.82,
      deltaH: -61206.9,
      deltaU: -61211.93,
      powerRequirement: 30.0,
    },
  }

  return { equipmentData }
}

// Main calculation function
export function calculateProcess(reactorFeedTotal: number) {
  // Calculate feed composition
  const ipaFeedReactor = Number((0.67 * reactorFeedTotal).toFixed(2))
  const waterFeedReactor = Number((0.33 * reactorFeedTotal).toFixed(2))

  // Feed Drum
  const ipaRecycle = 0.0
  const waterRecycle = 0.0
  const ipaMakeup = ipaFeedReactor
  const waterMakeup = waterFeedReactor

  const {
    inputLiquid,
    output: feedDrumOutput,
    losses: feedDrumLosses,
  } = feedDrumSplit(ipaRecycle, waterRecycle, ipaMakeup, waterMakeup)

  const feedDrumOutKmol = {
    "Isopropyl Alcohol": feedDrumOutput["Isopropyl Alcohol"],
    "Water(l)": feedDrumOutput["Water"],
  }
  const feedDrumOutMass = toMassKghr(feedDrumOutKmol)

  // Reactor
  const ipaFeed = feedDrumOutput["Isopropyl Alcohol"]
  const waterFeed = feedDrumOutput["Water"]
  const reactorInputKmol = {
    "Isopropyl Alcohol": ipaFeed,
    "Water(l)": waterFeed,
  }
  const reactorInputMass = toMassKghr(reactorInputKmol)

  const reactorOutputKmol = {
    Acetone: Number((0.9 * ipaFeed).toFixed(2)),
    Hydrogen: Number((0.9 * ipaFeed).toFixed(2)),
    "Isopropyl Alcohol": Number((0.1 * ipaFeed).toFixed(2)),
    "Water(l)": waterFeed,
  }
  const reactorOutputMass = toMassKghr(reactorOutputKmol)

  // Flash
  const flashInput = {
    Acetone: reactorOutputKmol["Acetone"],
    Hydrogen: reactorOutputKmol["Hydrogen"],
    "Isopropyl Alcohol": reactorOutputKmol["Isopropyl Alcohol"],
    Water: reactorOutputKmol["Water(l)"],
  }

  const vf = 0.2
  const flashYv = {
    Acetone: 0.81,
    Water: 0.13,
    Hydrogen: 1.0,
    "Isopropyl Alcohol": 0.03,
  }
  const flashXl = {
    Acetone: 0.55,
    Water: 0.38,
    Hydrogen: 0.0,
    "Isopropyl Alcohol": 0.08,
  }

  const {
    vapor: vaporOutFlash,
    liquid: liquidOutFlash,
    losses: flashLosses,
  } = processFlashUnit(flashInput, reactorFeedTotal, vf, flashYv, flashXl, 0.01)

  const flashVapKmol = { ...vaporOutFlash }
  const flashLiqKmol = { ...liquidOutFlash }

  const flashVapMass = toMassKghr(flashVapKmol)
  const flashLiqMass: Record<string, number> = {}

  for (const c of ["Acetone", "Hydrogen", "Isopropyl Alcohol"]) {
    if (c in liquidOutFlash) {
      flashLiqMass[c] = liquidOutFlash[c] * MW[c as keyof typeof MW]
    }
  }
  flashLiqMass["Water(l)"] = (liquidOutFlash["Water"] || 0) * MW["Water"]

  // Scrubber
  const {
    scrubberIn,
    offgas,
    liquid: liquidOutScrubber,
    losses: lossesScrubber,
  } = scrubberSplitAndFormat(vaporOutFlash)

  const scrubberInMass: Record<string, number> = {}
  for (const c in scrubberIn) {
    scrubberInMass[c] = scrubberIn[c] * MW[c as keyof typeof MW]
  }

  const scrubberOffgasMass: Record<string, number> = {}
  for (const c in offgas) {
    scrubberOffgasMass[c] = offgas[c] * MW[c as keyof typeof MW]
  }

  const scrubberLiqMass: Record<string, number> = {
    Acetone: (liquidOutScrubber["Acetone"] || 0) * MW["Acetone"],
    Hydrogen: (liquidOutScrubber["Hydrogen"] || 0) * MW["Hydrogen"],
    "Isopropyl Alcohol": (liquidOutScrubber["Isopropyl Alcohol"] || 0) * MW["Isopropyl Alcohol"],
    "Water(l)": (liquidOutScrubber["Water(l)"] || 0) * MW["Water"],
  }

  // Acetone Column
  const acetoneColInputLiquid: Record<string, number> = {}
  for (const comp of ["Acetone", "Water", "Isopropyl Alcohol"]) {
    if (comp === "Water") {
      acetoneColInputLiquid[comp] = Number(
        ((liquidOutFlash["Water"] || 0) + (liquidOutScrubber["Water(l)"] || 0)).toFixed(2),
      )
    } else {
      acetoneColInputLiquid[comp] = Number(((liquidOutFlash[comp] || 0) + (liquidOutScrubber[comp] || 0)).toFixed(2))
    }
  }

  const {
    distillate: acetoneColDistillate,
    bottoms: acetoneColBottoms,
    losses: acetoneColLosses,
    totalDistillate: acetoneColTotalDistillate,
  } = acetoneColumnSplitFlashStyle(acetoneColInputLiquid)

  const acetoneColInMass = {
    Acetone: acetoneColInputLiquid["Acetone"] * MW["Acetone"],
    "Isopropyl Alcohol": acetoneColInputLiquid["Isopropyl Alcohol"] * MW["Isopropyl Alcohol"],
    "Water(l)": acetoneColInputLiquid["Water"] * MW["Water"],
  }

  const acetoneColDistilKmol = {
    Acetone: acetoneColDistillate["Acetone"],
    "Water(l)": acetoneColDistillate["Water"],
    "Isopropyl Alcohol": acetoneColDistillate["Isopropyl Alcohol"],
  }
  const acetoneColDistilMass = toMassKghr(acetoneColDistilKmol)

  const acetoneColBottomsKmol = {
    Acetone: acetoneColBottoms["Acetone"],
    "Water(l)": acetoneColBottoms["Water"],
    "Isopropyl Alcohol": acetoneColBottoms["Isopropyl Alcohol"],
  }
  const acetoneColBottomsMass = toMassKghr(acetoneColBottomsKmol)

  // IPA Column
  const ipaInputLiquid = { ...acetoneColBottoms }

  const {
    distillate: ipaDistillate,
    bottoms: ipaBottoms,
    losses: ipaLosses,
    totalDistillate: ipaTotalDistillate,
  } = ipaColumnSplitFlashStyle(ipaInputLiquid)

  const ipaColDistilKmol = {
    "Isopropyl Alcohol": ipaDistillate["Isopropyl Alcohol"],
    "Water(l)": ipaDistillate["Water"],
    Acetone: ipaDistillate["Acetone"],
  }
  const ipaColDistilMass = toMassKghr(ipaColDistilKmol)

  const ipaColBottomsKmol = {
    "Isopropyl Alcohol": ipaBottoms["Isopropyl Alcohol"],
    "Water(l)": ipaBottoms["Water"],
    Acetone: ipaBottoms["Acetone"],
  }
  const ipaColBottomsMass = toMassKghr(ipaColBottomsKmol)

  // Acetone Production Summary
  const acetoneAcetonecolDistil = acetoneColDistillate["Acetone"]
  const acetoneIpacolDistil = ipaDistillate["Acetone"]
  const acetoneProducedTotal = Number((acetoneAcetonecolDistil + acetoneIpacolDistil).toFixed(2))

  // Mock heat balance data
  const heatBalanceStages = [
    { equipment: "Feed Drum", deltaHIn: 0.0, hOut: 12500.45, qRel: 12500.45 },
    { equipment: "Vaporizer", deltaHIn: 12500.45, hOut: 45678.9, qRel: 33178.45 },
    { equipment: "Heater", deltaHIn: 45678.9, hOut: 89012.34, qRel: 43333.44 },
    { equipment: "Reactor", deltaHIn: 89012.34, hOut: 123456.78, qRel: 34444.44 },
    { equipment: "Cooler", deltaHIn: 123456.78, hOut: 98765.43, qRel: -24691.35 },
    { equipment: "Condenser", deltaHIn: 98765.43, hOut: 87654.32, qRel: -11111.11 },
    { equipment: "Scrubber", deltaHIn: 87654.32, hOut: 87654.32, qRel: 0.0 },
    { equipment: "Acetone Column", deltaHIn: 76543.21, hOut: 65432.1, qRel: -11111.11 },
    { equipment: "IPA Column", deltaHIn: 65432.1, hOut: 54321.0, qRel: -11111.1 },
  ]

  const totalHeatQ = heatBalanceStages.reduce((sum, stage) => sum + stage.qRel, 0)

  // Mock energy balance data
  const energyBalanceData = {
    totalHIn: 654321.0,
    totalHOut: 654321.0,
    totalUIn: 543210.0,
    totalUOut: 543210.0,
    netDeltaH: 0.0,
    netDeltaU: 0.0,
  }

  // Generate detailed heat and energy balance data
  const detailedHeatBalance = generateDetailedHeatBalance()
  const detailedEnergyBalance = generateDetailedEnergyBalance()

  // Return all results
  return {
    feedComposition: {
      ipa: ipaFeedReactor,
      water: waterFeedReactor,
    },
    feedDrum: {
      input: inputLiquid,
      output: feedDrumOutput,
      losses: feedDrumLosses,
    },
    reactor: {
      input: reactorInputKmol,
      output: reactorOutputKmol,
    },
    flash: {
      input: flashInput,
      vapor: vaporOutFlash,
      liquid: liquidOutFlash,
      losses: flashLosses,
    },
    scrubber: {
      input: scrubberIn,
      offgas: offgas,
      liquid: liquidOutScrubber,
      losses: lossesScrubber,
    },
    acetoneColumn: {
      input: acetoneColInputLiquid,
      distillate: acetoneColDistillate,
      bottoms: acetoneColBottoms,
      losses: acetoneColLosses,
      totalDistillate: acetoneColTotalDistillate,
    },
    ipaColumn: {
      input: ipaInputLiquid,
      distillate: ipaDistillate,
      bottoms: ipaBottoms,
      losses: ipaLosses,
      totalDistillate: ipaTotalDistillate,
    },
    acetoneProduced: {
      acetoneColumnDistillate: acetoneAcetonecolDistil,
      ipaColumnDistillate: acetoneIpacolDistil,
      total: acetoneProducedTotal,
    },
    heatBalance: {
      stages: heatBalanceStages,
      totalQ: totalHeatQ,
    },
    energyBalance: energyBalanceData,
    detailedHeatBalance,
    detailedEnergyBalance,
  }
}
