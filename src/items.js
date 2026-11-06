export function itemPricing({mode,amount,quantity,gramsPerUse,gramAmount,unit}){
 const grams=mode==="bulk"?(unit==="gram"?1:gramsPerUse===""||gramsPerUse==null?null:Number(gramsPerUse)):null;
 if(grams!==null&&(!Number.isFinite(grams)||grams<=0))throw Error("Informe um peso válido por registro.");
 if(mode==="both"){
  const price=amount===""||amount==null?null:Number(amount);
  const rate=gramAmount===""||gramAmount==null?null:Number(gramAmount);
  if(price!==null&&(!Number.isFinite(price)||price<0))throw Error("Informe um preço válido por unidade.");
  if(rate!==null&&(!Number.isFinite(rate)||rate<0))throw Error("Informe um preço válido por grama.");
  const useGrams=unit==="gram"?1:gramsPerUse===""||gramsPerUse==null?null:Number(gramsPerUse);
  if(useGrams!==null&&(!Number.isFinite(useGrams)||useGrams<=0))throw Error("Informe um peso válido por registro.");
  return {price,gramPrice:rate,gramsPerUse:useGrams};
 }
 if(amount===""||amount==null)return {price:null,...(mode==="bulk"?{gramsPerUse:grams}:{})};
 const paid=Number(amount),size=Number(quantity);
 if(!Number.isFinite(paid)||paid<0)throw Error("Informe um preço válido.");
 if(mode==="unit")return {price:paid};
 if(!Number.isFinite(size)||size<=0)throw Error("Informe a quantidade contida na compra.");
 const rate=paid/size;
 if(mode==="bulk"){
   return {price:grams==null?null:Math.round(rate*grams*1e6)/1e6,gramPrice:rate,gramsPerUse:grams};
 }
 return {price:Math.round(rate*1e6)/1e6};
}

const normalizeItemName = name => String(name || "")
 .normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"")
 .toLowerCase();

export function inferAuraTone(name){
 const normalized=normalizeItemName(name);
 if(/\b(cigarro|cigarros|cigarette|tabaco|nicotina)\b/.test(normalized))return "attention";
 if(/\b(cannabis|maconha|baseado)\b/.test(normalized)&&/\b(fumad\w*|inalad\w*)\b/.test(normalized))return "attention";
 if(/\b(balinha|bala|balas|doce|doces|acucar|caramelo|chocolate|refrigerante)\b/.test(normalized)&&!/\b(sem acucar|zero acucar)\b/.test(normalized))return "attention";
 return "neutral";
}

export function auraToneForCategory(category){
 return category?.auraTone==="attention"||category?.auraTone==="neutral"
  ? category.auraTone
  : inferAuraTone(category?.name);
}

export function auraMessageForCategory(category){
 const tone=auraToneForCategory(category);
 const name=normalizeItemName(category?.name);
 if(tone==="attention"&&/\b(cannabis|maconha|baseado)\b/.test(name)&&/\b(cigarro|fumad\w*|inalad\w*)\b/.test(name)){
  return "Registro feito. O sinal é sobre a forma inalada, não sobre você.";
 }
 return tone==="attention"
  ? "Anotado. A AURA levantou uma sobrancelha — sem sermão."
  : "Anotado. A AURA piscou: registro feito, sem alerta nem julgamento.";
}
