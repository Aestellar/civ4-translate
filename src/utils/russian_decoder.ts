export class RussianDecoder{
// Initialize the translation maps


ruCivMap: Map<string, string>;
javRuMap: Map<string, string>;

constructor(){
    this.ruCivMap = new Map<string, string>();
    this.javRuMap = new Map<string, string>();
    // Initialize the dictionaries when the module loads
    this.loadDictionary();
}

private loadDictionary(): void {
  const ruLine = "\u0419\u0426\u0423\u041a\u0415\u041d\u0413\u0428\u0429\u0417\u0425\u042a\u0424\u042b\u0412\u0410\u041f\u0420\u041e\u041b\u0414\u0416\u042d\u042f\u0427\u0421\u041c\u0418\u0422\u042c\u0411\u042e\u0439\u0446\u0443\u043a\u0435\u043d\u0433\u0448\u0449\u0437\u0445\u044a\u0444\u044b\u0432\u0430\u043f\u0440\u043e\u043b\u0434\u0436\u044d\u044f\u0447\u0441\u043c\u0438\u0442\u044c\u0431\u044e";
  const civLine = "&#201;&#214;&#211;&#202;&#197;&#205;&#195;&#216;&#217;&#199;&#213;&#218;&#212;&#219;&#194;&#192;&#207;&#208;&#206;&#203;&#196;&#198;&#221;&#223;&#215;&#209;&#204;&#200;&#210;&#220;&#193;&#222;&#233;&#246;&#243;&#234;&#229;&#237;&#227;&#248;&#249;&#231;&#245;&#250;&#244;&#251;&#226;&#224;&#239;&#240;&#238;&#235;&#228;&#230;&#253;&#255;&#247;&#241;&#236;&#232;&#242;&#252;&#225;&#254;";
  const javLine = "\u00c9\u00d6\u00d3\u00ca\u00c5\u00cd\u00c3\u00d8\u00d9\u00c7\u00d5\u00da\u00d4\u00db\u00c2\u00c0\u00cf\u00d0\u00ce\u00cb\u00c4\u00c6\u00dd\u00df\u00d7\u00d1\u00cc\u00c8\u00d2\u00dc\u00c1\u00de\u00e9\u00f6\u00f3\u00ea\u00e5\u00ed\u00e3\u00f8\u00f9\u00e7\u00f5\u00fa\u00f4\u00fb\u00e2\u00e0\u00ef\u00f0\u00ee\u00eb\u00e4\u00e6\u00fd\u00ff\u00f7\u00f1\u00ec\u00e8\u00f2\u00fc\u00e1\u00fe";

  // Clear maps before loading (optional, for reusability)
  this.ruCivMap.clear();
  this.javRuMap.clear();

  // Build ruCivMap: Cyrillic -> HTML entities
  for (let i = 0; i < ruLine.length; i++) {
    const ruChar = ruLine[i];
    const civEntity = civLine.substring(i * 6, i * 6 + 6);
    this.ruCivMap.set(ruChar, civEntity);
  }

  // Build javRuMap: Latin with diacritics -> Cyrillic
  for (let i = 0; i < javLine.length; i++) {
    const javChar = javLine[i];
    const ruChar = ruLine[i];
    this.javRuMap.set(javChar, ruChar);
  }
}

public translateJavRu(text:string): string {
  const eString = text|| "";
  let result = "";

  for (let i = 0; i < eString.length; i++) {
    const char = eString[i];
    const translated = this.javRuMap.get(char);
    result += translated !== undefined ? translated : char;
  }

  return result
}

public translateRuCiv(text:string): string {
  const eString = text|| "";
  let result = "";

  for (let i = 0; i < eString.length; i++) {
    const char = eString[i];
    const translated = this.ruCivMap.get(char);
    result += translated !== undefined ? translated : char;
  }

  return result
}

}