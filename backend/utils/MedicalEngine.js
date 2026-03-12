// Custom Medical Analysis Engine v2 — Comprehensive, No API needed
// Uses MedicalData.js for conditions and built-in medication database

import { CONDITIONS_DB } from "./MedicalData.js";

// ===== EXPANDED MEDICATION DATABASE (100+ common Indian medicines) =====
const MEDS = {
  "paracetamol":{p:"Fever & pain relief (antipyretic/analgesic)",w:["Max 4g/day","Avoid in liver disease"]},
  "crocin":{p:"Fever & body ache (Paracetamol brand)",w:["Same as Paracetamol"]},
  "dolo":{p:"Fever & pain (Paracetamol 650mg)",w:["Max 4g/day"]},
  "calpol":{p:"Fever in children (Paracetamol syrup)",w:["Weight-based dosing"]},
  "ibuprofen":{p:"Pain, inflammation, fever (NSAID)",w:["Take with food","Avoid in kidney disease"]},
  "combiflam":{p:"Pain & fever (Ibuprofen + Paracetamol)",w:["Take with food","Max 3 tablets/day"]},
  "diclofenac":{p:"Pain & inflammation for arthritis/injury (NSAID)",w:["Take with food","Avoid long-term"]},
  "voveran":{p:"Pain relief (Diclofenac brand)",w:["Take with food"]},
  "aspirin":{p:"Pain, blood thinner, heart protection",w:["Can cause stomach bleeding","Not for children"]},
  "tramadol":{p:"Moderate-severe pain (opioid)",w:["Can be addictive","Drowsiness"]},
  "naproxen":{p:"Long-acting NSAID for pain & inflammation",w:["Take with food","GI risk"]},
  "mefenamic acid":{p:"Period pain & inflammation",w:["Short-term use only","Take with food"]},
  "azithromycin":{p:"Antibiotic for respiratory/skin/ear infections",w:["Complete full course","May cause diarrhea"]},
  "amoxicillin":{p:"Antibiotic for throat/ear/UTI infections",w:["Check penicillin allergy","Complete course"]},
  "augmentin":{p:"Amoxicillin + Clavulanate — stronger antibiotic",w:["Take with food","Complete course"]},
  "ciprofloxacin":{p:"Antibiotic for UTI, GI, respiratory infections",w:["Avoid dairy around dose","Tendon risk"]},
  "ofloxacin":{p:"Antibiotic for UTI, eye/ear infections",w:["Sun sensitivity","Complete course"]},
  "levofloxacin":{p:"Respiratory & urinary infection antibiotic",w:["Tendon risk","Avoid in elderly"]},
  "cefixime":{p:"Cephalosporin antibiotic for infections",w:["May cause diarrhea","Complete course"]},
  "ceftriaxone":{p:"Injectable antibiotic for serious infections",w:["Hospital use","Allergy check needed"]},
  "metronidazole":{p:"Antibiotic for anaerobic/parasitic infections",w:["NO alcohol with this","Metallic taste"]},
  "doxycycline":{p:"Antibiotic for acne/respiratory/malaria",w:["Sun sensitivity","Don't lie down after"]},
  "fluconazole":{p:"Antifungal for yeast/fungal infections",w:["Liver function monitoring"]},
  "clotrimazole":{p:"Topical antifungal cream for ringworm",w:["External use only","Complete 4-week course"]},
  "terbinafine":{p:"Oral/topical antifungal",w:["Liver monitoring for oral form"]},
  "acyclovir":{p:"Antiviral for herpes/chickenpox",w:["Start early for best effect","Stay hydrated"]},
  "cetirizine":{p:"Antihistamine for allergies/cold/itching",w:["May cause drowsiness"]},
  "levocetirizine":{p:"Non-drowsy antihistamine for allergies",w:["Less drowsy than cetirizine"]},
  "fexofenadine":{p:"Non-sedating antihistamine (Allegra)",w:["Take with water only"]},
  "montelukast":{p:"Asthma & allergy prevention",w:["Take at night","Report mood changes"]},
  "chlorpheniramine":{p:"Antihistamine for cold/allergy (older generation)",w:["Causes drowsiness"]},
  "omeprazole":{p:"Acid reducer for GERD/ulcers (PPI)",w:["Take before meals","Long-term bone risk"]},
  "pantoprazole":{p:"Proton pump inhibitor for acidity/GERD",w:["Take 30 min before food"]},
  "rabeprazole":{p:"PPI for peptic ulcer & acid reflux",w:["Take before breakfast"]},
  "ranitidine":{p:"H2 blocker for acidity",w:["Currently restricted"]},
  "famotidine":{p:"H2 blocker for acid reduction",w:["Alternative to ranitidine"]},
  "domperidone":{p:"Anti-nausea, improves stomach motility",w:["Take before food","Avoid in heart problems"]},
  "ondansetron":{p:"Anti-vomiting (antiemetic)",w:["May cause headache"]},
  "metoclopramide":{p:"Anti-nausea and stomach motility enhancer",w:["May cause restlessness"]},
  "ors":{p:"Oral Rehydration Salts for dehydration",w:["Dissolve in correct water quantity"]},
  "loperamide":{p:"Anti-diarrheal (Imodium)",w:["Not for bloody diarrhea","Short-term only"]},
  "isabgol":{p:"Psyllium husk for constipation/fiber supplement",w:["Take with plenty of water"]},
  "lactulose":{p:"Osmotic laxative for constipation",w:["May cause bloating initially"]},
  "metformin":{p:"Type 2 Diabetes first-line (lowers blood sugar)",w:["Take with food","GI upset initially"]},
  "glimepiride":{p:"Sulfonylurea for Type 2 Diabetes",w:["Risk of hypoglycemia","Take before meals"]},
  "insulin":{p:"Hormone for diabetes management",w:["Store properly","Monitor blood sugar"]},
  "sitagliptin":{p:"DPP-4 inhibitor for Type 2 Diabetes (Januvia)",w:["May cause joint pain"]},
  "atorvastatin":{p:"Cholesterol-lowering statin",w:["Take at night","Report muscle pain"]},
  "rosuvastatin":{p:"Potent statin for high cholesterol (Crestor)",w:["Take at night","Liver monitoring"]},
  "amlodipine":{p:"Blood pressure control (calcium channel blocker)",w:["Ankle swelling possible","Don't stop suddenly"]},
  "losartan":{p:"Blood pressure control (ARB)",w:["Avoid in pregnancy","Monitor potassium"]},
  "telmisartan":{p:"BP control — popular in India (ARB)",w:["Avoid in pregnancy"]},
  "ramipril":{p:"ACE inhibitor for BP & heart protection",w:["Dry cough side effect","Avoid in pregnancy"]},
  "enalapril":{p:"ACE inhibitor for hypertension/heart failure",w:["Dry cough possible"]},
  "metoprolol":{p:"Beta-blocker for BP & heart rate",w:["Don't stop suddenly","Avoid in asthma"]},
  "atenolol":{p:"Beta-blocker for hypertension",w:["Don't stop suddenly","Monitor heart rate"]},
  "hydrochlorothiazide":{p:"Diuretic for blood pressure",w:["Monitor electrolytes","Sun sensitivity"]},
  "furosemide":{p:"Loop diuretic for edema/heart failure (Lasix)",w:["Monitor potassium","Dehydration risk"]},
  "clopidogrel":{p:"Blood thinner to prevent clots/heart attack",w:["Bleeding risk","Don't stop without doctor"]},
  "warfarin":{p:"Blood thinner (anticoagulant)",w:["Regular INR monitoring","Many drug interactions"]},
  "levothyroxine":{p:"Thyroid hormone for hypothyroidism (Thyronorm)",w:["Empty stomach, 30 min before food"]},
  "salbutamol":{p:"Bronchodilator inhaler for asthma",w:["Use correctly","May cause tremors"]},
  "budesonide":{p:"Inhaled steroid for asthma prevention",w:["Rinse mouth after use"]},
  "prednisolone":{p:"Oral steroid for inflammation/allergy/asthma",w:["Taper gradually","May raise blood sugar"]},
  "dexamethasone":{p:"Potent steroid for severe inflammation",w:["Short-term only","Many side effects"]},
  "methylprednisolone":{p:"Steroid for severe inflammation/allergic reactions",w:["Taper dose"]},
  "gabapentin":{p:"Nerve pain (neuropathy) & seizures",w:["Drowsiness","Don't stop suddenly"]},
  "pregabalin":{p:"Nerve pain, fibromyalgia, anxiety",w:["Drowsiness","Dependence risk"]},
  "carbamazepine":{p:"Epilepsy/seizures & nerve pain",w:["Regular blood monitoring","Skin reaction risk"]},
  "valproate":{p:"Epilepsy, bipolar disorder, migraines",w:["Liver monitoring","Avoid in pregnancy"]},
  "phenytoin":{p:"Anti-epileptic for seizures",w:["Therapeutic drug monitoring needed","Gum overgrowth"]},
  "escitalopram":{p:"SSRI antidepressant for depression/anxiety",w:["Takes 2-4 weeks to work","Don't stop suddenly"]},
  "sertraline":{p:"SSRI antidepressant — safe in pregnancy",w:["Takes 2-4 weeks","GI upset initially"]},
  "fluoxetine":{p:"SSRI antidepressant (Prozac)",w:["Takes 2-4 weeks to work"]},
  "amitriptyline":{p:"Tricyclic for depression, migraine prevention, nerve pain",w:["Drowsiness","Weight gain"]},
  "alprazolam":{p:"Benzodiazepine for acute anxiety/panic",w:["Highly addictive","Short-term only"]},
  "clonazepam":{p:"Benzodiazepine for anxiety, seizures, sleep",w:["Dependence risk","Don't mix with alcohol"]},
  "zolpidem":{p:"Sleep aid for insomnia",w:["Short-term use only","Drowsy next morning"]},
  "multivitamin":{p:"General nutritional supplement",w:["Not a food substitute"]},
  "vitamin d":{p:"Bone health, immunity, calcium absorption",w:["Don't exceed dose"]},
  "vitamin b12":{p:"Essential for nerves & blood cells. Vegetarians often deficient",w:["Injection may be needed"]},
  "calcium":{p:"Bone & teeth health",w:["Don't take with iron"]},
  "iron":{p:"Iron supplement for anemia",w:["Take with vitamin C","May cause constipation"]},
  "folic acid":{p:"Essential in pregnancy for neural tube development",w:["Start before conception ideally"]},
  "zinc":{p:"Immunity booster, wound healing",w:["Take with food to avoid nausea"]},
  "ursodeoxycholic acid":{p:"Bile acid for gallstones & liver disease",w:["Take with food"]},
  "ranitidine":{p:"Acid reducer (H2 blocker)",w:["Restricted in many countries"]},
  "sucralfate":{p:"Stomach ulcer coating agent",w:["Take on empty stomach"]},
  "norfloxacin":{p:"Antibiotic for UTI and GI infections",w:["Complete course","Adequate hydration"]},
  "tinidazole":{p:"Antiparasitic/antiprotozoal",w:["No alcohol"]},
  "albendazole":{p:"Deworming medication",w:["Take with fatty meal"]},
  "ivermectin":{p:"Antiparasitic for worms & scabies",w:["Take on empty stomach"]},
  "hydroxychloroquine":{p:"For malaria, rheumatoid arthritis, lupus",w:["Eye checkup needed regularly"]},
  "minoxidil":{p:"Topical for hair regrowth",w:["May cause initial shedding","Skin irritation"]},
  "finasteride":{p:"Oral hair loss treatment in men",w:["Not for women","Sexual side effects possible"]},
  "sildenafil":{p:"Erectile dysfunction treatment (Viagra)",w:["Don't combine with nitrates","Heart check first"]},
  "tamsulosin":{p:"For prostate enlargement (BPH)",w:["Dizziness on standing","Take after meal"]},
};

// ===== SMART SYMPTOM ANALYZER =====
export function analyzeSymptoms(text, age, gender) {
  const input = text.toLowerCase().replace(/[^\w\s]/g, " ");
  const words = input.split(/\s+/).filter(w => w.length > 2);

  // Score each condition entry
  const scored = CONDITIONS_DB.map(entry => {
    let score = 0;
    for (const kw of entry.keywords) {
      const parts = kw.split(" ");
      if (parts.length > 1 && parts.every(p => input.includes(p))) {
        score += 4; // Multi-word exact match
      } else if (input.includes(kw)) {
        score += 3; // Full keyword match
      } else {
        for (const p of parts) {
          if (p.length > 3 && words.some(w => w.includes(p) || p.includes(w))) {
            score += 1; // Partial/fuzzy match
          }
        }
      }
    }
    return { entry, score };
  }).filter(m => m.score > 0).sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      possibleCauses: [{ name: "Unable to Match Symptoms", probability: "N/A", description: "Your symptoms don't match our database precisely. This doesn't mean nothing is wrong — please consult a doctor for proper examination. Describe your symptoms in detail: location of pain, duration, severity, and any other symptoms." }],
      severity: "Moderate",
      recommendedSpecialist: "General Physician",
      immediateActions: ["Visit a General Physician for thorough examination", "Note down all symptoms with timeline", "Get basic blood tests (CBC, ESR, CRP)", "Don't ignore persistent symptoms"],
      disclaimer: "This analysis engine covers common conditions. For rare or complex conditions, professional medical evaluation is essential.",
    };
  }

  // Combine top matches
  const conditions = [];
  const seen = new Set();
  for (const m of scored.slice(0, 3)) {
    for (const c of m.entry.conditions) {
      if (!seen.has(c.name)) { seen.add(c.name); conditions.push(c); }
    }
  }

  // Highest severity
  const sevOrder = { Mild: 1, Moderate: 2, Severe: 3, Critical: 4 };
  let severity = scored[0].entry.severity;
  for (const m of scored.slice(0, 2)) {
    if ((sevOrder[m.entry.severity] || 0) > (sevOrder[severity] || 0)) severity = m.entry.severity;
  }

  // Age adjustment
  const ageNum = parseInt(age);
  if (ageNum && (ageNum > 65 || ageNum < 3)) {
    if (severity === "Mild") severity = "Moderate";
    else if (severity === "Moderate") severity = "Severe";
  }

  // Combine actions
  const actions = new Set();
  for (const m of scored.slice(0, 2)) for (const a of m.entry.actions) actions.add(a);

  return {
    possibleCauses: conditions.slice(0, 5),
    severity,
    recommendedSpecialist: scored[0].entry.specialist,
    immediateActions: Array.from(actions).slice(0, 7),
    disclaimer: "This analysis is from a rule-based medical engine with 50+ condition categories. It is NOT a substitute for professional diagnosis. Always consult a qualified doctor.",
  };
}

// ===== SMART PRESCRIPTION PARSER =====
export function analyzePrescriptionText(text) {
  const input = text.toLowerCase();
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Find medications
  const medications = [];
  const foundMeds = new Set();
  for (const [name, info] of Object.entries(MEDS)) {
    if (input.includes(name) && !foundMeds.has(name)) {
      foundMeds.add(name);
      const line = lines.find(l => l.toLowerCase().includes(name)) || "";
      const dose = line.match(/(\d+\s*(mg|ml|mcg|g|units?|iu|tab|cap|drops?)[\w\s/.-]*)/i);
      medications.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        dosage: dose ? dose[0].trim() : "As prescribed",
        purpose: info.p,
      });
    }
  }

  // Also try matching from symptoms/conditions (for free-text descriptions)
  const symptomResult = analyzeSymptoms(text, "", "");

  // Collect warnings
  const warnings = [];
  for (const [name] of Object.entries(MEDS)) {
    if (input.includes(name) && MEDS[name].w) {
      for (const w of MEDS[name].w) warnings.push(`${name.charAt(0).toUpperCase() + name.slice(1)}: ${w}`);
    }
  }

  // Extract diagnosed conditions from text
  const diagnosedConditions = [];
  const patterns = [/diagnosis[:\s-]+(.+)/i, /diagnosed\s+with[:\s]+(.+)/i, /condition[:\s-]+(.+)/i, /impression[:\s-]+(.+)/i, /assessment[:\s-]+(.+)/i, /complaint[:\s-]+(.+)/i, /problem[:\s-]+(.+)/i];
  for (const line of lines) {
    for (const pat of patterns) {
      const m = line.match(pat);
      if (m) diagnosedConditions.push(m[1].trim());
    }
  }

  // If no explicit diagnosis found, use symptom analysis
  if (diagnosedConditions.length === 0 && symptomResult.possibleCauses[0]?.name !== "Unable to Match Symptoms") {
    for (const c of symptomResult.possibleCauses.slice(0, 2)) diagnosedConditions.push(c.name);
  }

  // Severity
  let severity = "Mild";
  const seriousMeds = ["insulin","metformin","atorvastatin","amlodipine","losartan","metoprolol","warfarin","clopidogrel","prednisolone","dexamethasone","carbamazepine","valproate","phenytoin"];
  const moderateMeds = ["azithromycin","amoxicillin","ciprofloxacin","augmentin","cefixime","omeprazole","pantoprazole","montelukast","escitalopram"];
  if (seriousMeds.some(m => input.includes(m))) severity = "Severe";
  else if (moderateMeds.some(m => input.includes(m))) severity = "Moderate";
  else if (symptomResult.severity && symptomResult.severity !== "Mild") severity = symptomResult.severity;

  // Specialist
  const specialist = medications.length > 0
    ? (seriousMeds.some(m => input.includes(m)) ? symptomResult.recommendedSpecialist : "General Physician")
    : symptomResult.recommendedSpecialist;

  // Follow-up actions
  const followUp = ["Complete full medication course as prescribed", "Follow up with your doctor on scheduled date"];
  if (medications.length > 3) followUp.push("Ask pharmacist about potential drug interactions");
  if (severity === "Severe") followUp.push("Regular monitoring tests may be required");
  followUp.push(...symptomResult.immediateActions.slice(0, 3));

  const summary = medications.length > 0
    ? `Found ${medications.length} medication(s). ${diagnosedConditions.length > 0 ? `Conditions: ${diagnosedConditions.join(", ")}.` : ""} Severity: ${severity}. Recommended: ${specialist}.`
    : diagnosedConditions.length > 0
    ? `Identified conditions: ${diagnosedConditions.join(", ")}. Severity: ${severity}. Consult ${specialist}. ${symptomResult.possibleCauses[0]?.description || ""}`
    : `Analysis: ${symptomResult.possibleCauses[0]?.description || "Please provide more details or consult a doctor."}`;

  return {
    medications,
    diagnosedConditions: diagnosedConditions.length > 0 ? diagnosedConditions : (symptomResult.possibleCauses[0]?.name !== "Unable to Match Symptoms" ? [symptomResult.possibleCauses[0]?.name] : ["Consult doctor for diagnosis"]),
    recommendedSpecialist: specialist,
    severity,
    followUpActions: [...new Set(followUp)].slice(0, 7),
    warnings: warnings.slice(0, 10),
    summary,
  };
}
