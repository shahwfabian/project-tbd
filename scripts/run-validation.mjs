import { runUntouchedValidationProtocol } from "../lib/validation.ts";

const result=runUntouchedValidationProtocol();
console.log(JSON.stringify({generatedAt:"2026-08-11",synthetic:true,selectionMetric:result.selectionMetric,selected:result.selected.name,trainSeeds:result.trainSeeds,validationSeeds:result.validationSeeds,finalSeeds:result.finalSeeds,train:result.train,validation:result.validation,final:result.final,validationUntouched:result.validationUntouched,finalUntouched:result.finalUntouched},null,2));
