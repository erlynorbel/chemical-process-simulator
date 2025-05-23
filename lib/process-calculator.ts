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
  }
}
