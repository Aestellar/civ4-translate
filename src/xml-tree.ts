import { CivText } from "./text-object";
import { RussianDecoder } from "./utils/russian_decoder";
export class XMLTree {

    public textMap: Record<string, CivText>;
    xmlDocument: Node;
    xmlNS: string | null | undefined;
    russianDecoder: RussianDecoder

    constructor(xmlText: string, addMessage: (t: string) => void) {
        this.russianDecoder = new RussianDecoder()
        const parser = new DOMParser();
        const xmlDocument = parser.parseFromString(xmlText, 'text/xml');
        this.xmlDocument = xmlDocument
        this.xmlNS = xmlDocument.querySelector("Civ4GameText")?.getAttribute("xmlns")
        const textElements = xmlDocument.querySelectorAll("Civ4GameText > TEXT")

        let duplicateCount = 0;
        const duplicateTags: string[] = [];
        // 🧩 Track the **one allowed** language scheme
        let globalLangScheme: string | null = null;
        let hasLangSchemeError = false;

        let textMap: Record<string, CivText> = {}
        for (let textElt of textElements) {
            let civText = new CivText(textElt, this.russianDecoder)
            const tagName = civText.tagName
            if (textMap.hasOwnProperty(tagName)) {
                // 🔸 Duplicate found!
                duplicateCount++;
                if (!duplicateTags.includes(tagName)) {
                    duplicateTags.push(tagName); // log first time we see this duplicate
                }
                addMessage(`Duplicate TXT_KEY found: "${tagName}". Keeping first occurrence.`)
            }
            else {
                textMap[tagName] = civText
            }
            // const langScheme = civText.getLanguages()//string[]
            //Need to check different schemes in every new civText. Count every lang schemes and addMessages as langscheme : count of lang scheme occurences
            // 🔹 Enforce SINGLE global language scheme
            const currentLangs = civText.getLanguages(); // string[]

            // Skip entries with no languages (if allowed)
            if (currentLangs.length === 0) {
                addMessage(`Warning: Entry "${tagName}" has no language tags.`);
                continue;
            }

            const currentScheme = currentLangs.join(';');

            if (globalLangScheme === null) {
                // First valid entry → define the canonical scheme
                globalLangScheme = currentScheme;
            } else if (currentScheme !== globalLangScheme) {
                // ❌ Violation: different scheme detected!
                // if (!hasLangSchemeError) {
                    // Report only once to avoid spam
                    addMessage(
                        `❌ Language scheme mismatch! Expected "${globalLangScheme}", ` +
                        `but found "${currentScheme}" in entry "${tagName}". Only one language scheme is allowed.`
                    );
                    hasLangSchemeError = true;
                // }
                // Optional: you could throw an error or mark this entry as invalid
            }
            // Optional: Final validation

        }
            if (globalLangScheme === null) {
            addMessage("⚠️ No valid language scheme found in any entry.");
            } else if (!hasLangSchemeError) {
            addMessage(`✅ Validated: all entries use language scheme "${globalLangScheme}".`);
            }

        this.textMap = textMap
    }

    public getNamespace() {
        return this.xmlNS
    }

    public xmlToString(): string {
        Object.entries(this.textMap).forEach(([, civText]) => {
            civText.updateXML()
        });
        const serializer = new XMLSerializer();
        let result = serializer.serializeToString(this.xmlDocument)
        const formatted = this.formatXml(result)
        return formatted;
    }


    addNewTag(tag: string, baseTag: string) {
        console.log("Try to add new tag to xml tree", tag)
        Object.entries(this.textMap).forEach(([, civText]) => {
            civText.addNewTagXML(tag, baseTag)
        });
    }

    public formatXml(xml: string): string {
        const reg = /(>)(<)(\/*)/g;
        xml = xml.replace(reg, '$1\r\n$2$3'); // add newlines between tags

        let pad = 0;
        let formatted = '';
        const lines = xml.split('\r\n');

        lines.forEach((node: string) => {
            if (node.match(/^<\/\w/)) {
                // closing tag; decrease padding before adding line
                pad = Math.max(pad - 1, 0);
            }
            formatted += '  '.repeat(1) + node + '\r\n';

        });

        return formatted.trim();
    }

}