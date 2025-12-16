import { CivText } from "./text-object";
import type { TextValue } from "./ts/types";
import type { MessageType } from "./types";
import { RussianDecoder } from "./utils/russian_decoder";
export class XMLTree {


    public textMap: Record<string, CivText>;
    xmlDocument: Document;
    xmlNS: string | null | undefined;
    russianDecoder: RussianDecoder
    addMessage: (t: string, messageType?: MessageType) => void;
    duplicateTags: string[];

    constructor(xmlText: string, addMessage: (t: string, messageType?: MessageType) => void) {
        this.addMessage = addMessage
        this.russianDecoder = new RussianDecoder()
        const parser = new DOMParser();
        const xmlDocument = parser.parseFromString(xmlText, 'text/xml');
        this.xmlDocument = xmlDocument
        this.xmlNS = xmlDocument.querySelector("Civ4GameText")?.getAttribute("xmlns")
        const textElements = xmlDocument.querySelectorAll("Civ4GameText > TEXT")

        let duplicateCount = 0;
        this.duplicateTags = [];
        // 🧩 Track the **one allowed** language scheme
        let globalLangScheme: string | null = null;
        let hasLangSchemeError = false;

        let textMap: Record<string, CivText> = {}
        for (let textElt of textElements) {
            // ⚠️ Convert to array early so we can safely remove from DOM
            const civText = new CivText(textElt, this.russianDecoder, addMessage);
            const tagName = civText.tagName;

            if (textMap.hasOwnProperty(tagName)) {
                // 🔸 Duplicate: remove from DOM and warn
                duplicateCount++;
                if (!this.duplicateTags.includes(tagName)) {
                    this.duplicateTags.push(tagName);
                    addMessage(`Duplicate TXT_KEY found: "${tagName}". Keeping first occurrence, all others will be discarded `, "warning");
                }
                // 💥 Remove duplicate node from XML document
                textElt.remove(); // or: textElt.parentNode?.removeChild(textElt);
            } else {
                textMap[tagName] = civText;
            }

            const currentLangs = civText.getLanguages(); // string[]
            if (currentLangs.length === 0) {
                addMessage(`Warning: Entry "${tagName}" has no language tags.`);
                continue;
            }

            const currentScheme = currentLangs.join(';');
            if (globalLangScheme === null) {
                globalLangScheme = currentScheme;
            }
            else if (currentScheme !== globalLangScheme) {
                addMessage(`Language scheme mismatch! Expected "${globalLangScheme}", ` +
                    `but found "${currentScheme}" in entry "${tagName}". Only one language scheme is allowed.`, "error");
                hasLangSchemeError = true;
            }
        }
        if (globalLangScheme === null) {
            addMessage("No valid language scheme found in any entry.", "warning");
        } else if (!hasLangSchemeError) {
            addMessage(`Validated: all entries use language scheme "${globalLangScheme}".`, "success");
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
        result = result.replace('iso-8859-1','utf-8')
        const formatted = this.formatXml(result)
        return formatted;
    }

        /**
         * Creates a new CivText entry with the given TXT_KEY, initializes all languages
         * from the global language scheme, and fills base language (English) with
         * auto-generated display text derived from the key.
         * 
         * Example: "TXT_KEY_LEADER_BARBARIAN" → "Leader Barbarian"
         * 
         * @param txtKey - The TXT_KEY (e.g., "TXT_KEY_CITY_NAME")
         * @returns The newly created CivText instance
         */
        public createAndAddTextEntry(txtKey: string): CivText {
        if (this.textMap[txtKey]) {
            this.addMessage(`Entry with TXT_KEY "${txtKey}" already exists.`, "warning");
            return this.textMap[txtKey];
        }

        // 1. Determine global language scheme (from existing entries)
        const globalLangScheme = this.getConsistentLanguageScheme();
        if (!globalLangScheme || globalLangScheme.length === 0) {
            this.addMessage(
            `No global language scheme found. Creating entry without languages.`, 
            "warning"
            );
        }

        // 2. Generate default display text from TXT_KEY
        const displayText = this.generateDisplayTextFromKey(txtKey);

        // 3. Create a new <TEXT> DOM element
        const doc = this.xmlDocument as Document;
        const textElt = doc.createElementNS(this.xmlNS||null, "TEXT");
        
        const tagElt = doc.createElementNS(this.xmlNS||null, "Tag");
        tagElt.textContent = txtKey;
        textElt.appendChild(tagElt);

        // 4. Append to root <Civ4GameText>
        const root = this.xmlDocument.querySelector("Civ4GameText");
        if (!root) {
            throw new Error("Root <Civ4GameText> element not found in XML document");
        }
        root.appendChild(textElt);

        // 5. Create CivText instance
        const civText = new CivText(textElt, this.russianDecoder, this.addMessage);

        // 6. Initialize all languages from global scheme
        if (globalLangScheme && globalLangScheme.length > 0) {
            const languages: Record<string, import("./ts/types").TextValue> = {};
            
            for (const lang of globalLangScheme) {
            // Use displayText for English (or first language as fallback)
            const text = lang === "English" || globalLangScheme[0] === lang
                ? displayText
                : displayText; // empty for other languages

            languages[lang] = { text, gender: undefined, plural: undefined };
            }

            civText.languages = languages;
            civText.updateLangOrder();
        }

        // 7. Sync to DOM
        civText.updateXML();

        // 8. Register in textMap
        this.textMap[txtKey] = civText;

        this.addMessage(`Created new entry: "${txtKey}" with languages ${globalLangScheme?.join(", ") || "(none)"}.`, "success");
        return civText;
        }
/**
 * Converts a TXT_KEY like "TXT_KEY_LEADER_BARBARIAN" into human-readable text:
 * → "Leader Barbarian"
 */
private generateDisplayTextFromKey(key: string): string {
  // Remove "TXT_KEY_" prefix (case-insensitive)
  let clean = key.replace(/^TXT_KEY_/i, '');

  // Split on underscores, title-case each word, join with spaces
  return clean
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
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

    /**
     * Imports localization data from another XMLTree.
     * - Matches entries by TXT_KEY (tagName)
     * - Only imports languages that exist in both source and target
     * - Validates language scheme consistency
     * - Throws error if language schemes are incompatible
     */
    importTags(newTree: XMLTree): void {
        // Validate language scheme compatibility
        const thisLanguages = this.getConsistentLanguageScheme();
        const newLanguages = newTree.getConsistentLanguageScheme();

        if (!thisLanguages || !newLanguages) {
            throw new Error("Cannot import: One of the XML trees has no valid language scheme");
        }

        // Find common languages between both trees
        const commonLanguages = thisLanguages.filter(lang => newLanguages.includes(lang));

        if (commonLanguages.length === 0) {
            throw new Error(`No common languages found between source [${thisLanguages.join(', ')}] and target [${newLanguages.join(', ')}]`);
        }

        // Track if we made any changes
        let changesMade = false;

        // Iterate through all tags in the new tree
        for (const [tagKey, newCivText] of Object.entries(newTree.textMap)) {
            const existingCivText = this.textMap[tagKey];

            if (!existingCivText) {
                // Skip tags that don't exist in the current tree
                continue;
            }

            // Import only common languages
            let tagModified = false;
            for (const lang of commonLanguages) {
                const newLangData = newCivText.getLanguageData(lang);
                const existingLangData = existingCivText.getLanguageData(lang);

                // Only update if data exists in source and is different
                if (newLangData) {
                    const hasChanges =
                        existingLangData?.text !== newLangData.text ||
                        existingLangData?.gender !== newLangData.gender ||
                        existingLangData?.plural !== newLangData.plural;

                    if (hasChanges) {
                        existingCivText.setLanguageData(lang, newLangData);
                        tagModified = true;
                        changesMade = true;
                    }
                }
            }

            if (tagModified) {
                // Ensure XML is updated in the document
                existingCivText.updateXML();
            }
        }

        if (changesMade) {
            // Update language order for all modified entries
            for (const civText of Object.values(this.textMap)) {
                civText.updateLangOrder();
            }
        }
    }

    /**
     * Helper method to get the consistent language scheme for this XML tree
     * Returns sorted array of languages or null if inconsistent/empty
     */
    private getConsistentLanguageScheme(): string[] | null {
        if (Object.keys(this.textMap).length === 0) {
            return null;
        }

        // Get languages from first entry as reference
        const firstEntry = Object.values(this.textMap)[0];
        const referenceLanguages = firstEntry.getLanguages().sort();

        // Verify all entries have the same language scheme
        for (const civText of Object.values(this.textMap)) {
            const currentLanguages = civText.getLanguages().sort();
            if (JSON.stringify(currentLanguages) !== JSON.stringify(referenceLanguages)) {
                return null; // Inconsistent scheme
            }
        }

        return referenceLanguages;
    }

    /**
     * Unifies all entries to use a consistent language order.
     * Missing languages are created by cloning from a fallback (English preferred).
     * Tag order in XML will be updated to match the scheme.
     * 
     * @param targetLangOrder - Desired language order, e.g. ["Russian", "English"]
     */
    unifyLanguageOrder(targetLangOrder: string[]): void {
        if (targetLangOrder.length === 0) {
            throw new Error("Target language order cannot be empty");
        }

        // Normalize: ensure no duplicates
        const uniqueLangs = [...new Set(targetLangOrder)];
        if (uniqueLangs.length !== targetLangOrder.length) {
            this.addMessage("Duplicate languages in target order; deduplicated.", "warning")
        }

        for (const civText of Object.values(this.textMap)) {
            const currentLangs = civText.getLanguages();
            const newLanguages: Record<string, TextValue> = {};

            // Determine fallback language for cloning
            let fallbackLang = "English";
            if (!currentLangs.includes(fallbackLang)) {
                fallbackLang = currentLangs[0] || targetLangOrder[0]; // Best effort
            }

            // Rebuild languages in target order
            for (const lang of uniqueLangs) {
                if (currentLangs.includes(lang)) {
                    // Language exists — keep as-is
                    newLanguages[lang] = civText.getLanguageData(lang)!;
                } else {
                    // Language missing — clone from fallback
                    const fallbackData = civText.getLanguageData(fallbackLang);
                    if (fallbackData) {
                        // Deep clone to avoid reference issues
                        newLanguages[lang] = JSON.parse(JSON.stringify(fallbackData));
                        // Optionally mark as auto-created (for debugging)
                        // console.log(`Added missing language "${lang}" in ${civText.tagName} (cloned from ${fallbackLang})`);
                    } else {
                        // Fallback not available — create empty
                        newLanguages[lang] = { text: "", gender: undefined, plural: undefined };
                        this.addMessage(`Created empty entry for missing language "${lang}" in ${civText.tagName}`, "warning");
                    }
                }
            }

            // Replace and sync
            civText.languages = newLanguages;
            civText.updateLangOrder();
            civText.updateXML(); // This will reorder <Russian>, <English>, etc. in DOM
        }

        this.addMessage(`Unified all entries to language order: ${uniqueLangs.join(";")}`, "success");
    }


}