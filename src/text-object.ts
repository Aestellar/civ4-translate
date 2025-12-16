import type { TextValue } from "./ts/types";
import type { MessageType } from "./types";
import type { RussianDecoder } from "./utils/russian_decoder";

/**
 * Represents a localized <TEXT> node from Civ-style XML.
 * Extracts Tag and multi-language content.
 */
export class CivText {


    public tagName: string;
    public languages: Record<string, TextValue>;

    textNode: Element;
    namespace: string | null;
    russianDecoder: RussianDecoder;
    langOrderMap: { [k: string]: number; } | undefined;
    addMessage: (t: string, messageType?: MessageType)=>void

    /**
     * @param textNode - An XmlObject representing a <TEXT> element
     */
    constructor(textNode: Element, russianDecoder: RussianDecoder, addMessage: (t: string, messageType?: MessageType)=>void) {
        this.russianDecoder = russianDecoder
        if (textNode.tagName !== 'TEXT') {
            throw new Error('CivText constructor expects a <TEXT> node');
        }

        const tag = textNode.querySelector("Tag")?.textContent;
        if (!tag) {
            throw new Error('<TEXT> node is missing "Tag" attribute');
        }
        this.tagName = tag;
        this.textNode = textNode
        this.namespace = textNode.namespaceURI
        // Parse language content
        this.languages = this.extractLanguages(textNode);
        this.updateLangOrder()
        this.addMessage = addMessage;
    }


    public updateLangOrder() {
        const entries = Object.entries(this.languages);
        const langOrderMap = Object.fromEntries(
            entries.map(([lang], index) => [lang, index])
        );
        this.langOrderMap = langOrderMap
}

    // public getLangOrder(lang:string):string{
    //     if(this.langOrderMap){
    //         return this.langOrderMap[lang].toString()
    //     }

    //     return ""
    // }

public getLanguageIndex(lang: string): number {
    return this.langOrderMap?.[lang] ?? -1;
}


    private extractLanguages(node: Element): Record<string, TextValue> {
        const langMap: Record<string, TextValue> = {};

        // Iterate over direct children that are language tags (e.g., <Russian>, <English>)
        for (const langElt of Array.from(node.children)) {
            if (langElt.tagName.toLowerCase() === 'Tag'.toLowerCase()) continue; // Skip <Tag>

            const lang = langElt.tagName;

            // Check if this language element has nested <TEXT>, <Gender>, <Plural>
            const textChild = langElt.querySelector('Text')||langElt.querySelector('TEXT');
            const genderChild = langElt.querySelector('Gender');
            const pluralChild = langElt.querySelector('Plural');

            // If <TEXT> exists, use its content; otherwise, use whole textContent (legacy format)
            let text = '';
            if (textChild) {
                text = textChild.textContent|| '';
            } else {
                // Fallback: use direct text (e.g., for simple <Russian>...</Russian>)
                text = langElt.textContent|| '';
            }

            if (lang === "Russian") {
                text = this.decodeRussian(text)
            }

            const gender = genderChild?.textContent
            const plural = pluralChild?.textContent

            langMap[lang] = { text, gender, plural };
        }

        return langMap;
    }

    public setLanguageData(lang: string, data: { text: string; gender?: string; plural?: string }): void {
        console.log("lang data before update", this.languages, data)
        this.languages[lang] = {
            text: data.text,
            gender: data.gender||undefined,
            plural: data.plural||undefined,
        };
        console.log("lang data after update", this.languages, data)
        this.updateXML()
    }

    public updateXML() {
        let newTextElt = this.toXmlObject()
        this.textNode.replaceChildren(...newTextElt.children)

    }

public hasText(text: string): boolean {
    const normalized = text.toLowerCase();
    for (const lang of this.getLanguages()) {
        if (this.languages[lang].text.toLowerCase().includes(normalized)) {
            return true;
        }
    }
    return false;
}

    /**
     * Updates or adds content for a specific language.
     */
    /**
     * Convenience method to update only the text for a language.
     */
    public setContent(lang: string, text: string): void {
        const current = this.languages[lang] || {};
        this.setLanguageData(lang, { ...current, text });
    }

    /**
     * Sets gender for a language.
     */
    public setGender(lang: string, gender: string): void {
        const current = this.languages[lang] || { text: '' };
        this.setLanguageData(lang, { ...current, gender });
    }

    /**
     * Sets plural rule for a language.
     */
    public setPlural(lang: string, plural: string): void {
        const current = this.languages[lang] || { text: '' };
        this.setLanguageData(lang, { ...current, plural });
    }

    /**
     * Returns all language codes present.
     */
    public getLanguages(): string[] {
        return Object.keys(this.languages);
    }

    /**
     * Gets full data for a language.
     */
    public getLanguageData(lang: string): TextValue | undefined {
        return this.languages[lang];
    }

    /**
     * Gets only the text content for a language.
     */
    public getContent(lang: string): string | undefined {
        return this.languages[lang]?.text;
    }

    /**
     * Gets gender for a language.
     */
    public getGender(lang: string): string | undefined {
        return this.languages[lang]?.gender;
    }

    /**
     * Gets plural rule for a language.
     */
    public getPlural(lang: string): string | undefined {
        return this.languages[lang]?.plural;
    }


    public getContentText(): string {
        let text = this.textNode.textContent || ""
        return text
    }


addNewTagXML(tag: string, baseTag: string) {
    const base = this.languages[baseTag];
    if (!base) {
        this.addMessage(`Base language "${baseTag}" not found for tag "${tag}"`,"error")
        console.warn();
        return;
    }
    this.languages[tag] = JSON.parse(JSON.stringify(base));
    this.updateXML();
    this.updateLangOrder();
}
    
// In CivText class
public hasEqualText(lang1: string, lang2: string): boolean {
    const data1 = this.getLanguageData(lang1);
    const data2 = this.getLanguageData(lang2);
    
    // If either is missing, they can't be equal
    if (!data1 || !data2) return false;
    
    // Compare decoded text (case-sensitive or insensitive?)
    // Usually: case-sensitive for exact match, but you decide
    return data1.text === data2.text;
}

    /**
     * Converts back to an XML Element (for saving).
     */
    public toXmlObject(): Element {
        const ns = this.namespace || "";
        // Create a document with the specified namespace
        const doc = document.implementation.createDocument(ns, null, null);

        const textElt = doc.createElementNS(ns, 'TEXT');
        const tagElt = doc.createElementNS(ns, 'Tag');
        tagElt.textContent = this.tagName;
        textElt.appendChild(tagElt);

        for (const lang of this.getLanguages()) {
            const data = this.languages[lang];
            const langElt = doc.createElementNS(ns, lang);
            let newText = data.text
            if (newText) { newText = this.codeRussian(newText) }
            if (data.gender !== undefined || data.plural !== undefined) {
                // Complex structure
                if (data.text !== undefined) {
                    const textNode = doc.createElementNS(ns, 'TEXT');
                    textNode.textContent = newText;
                    langElt.appendChild(textNode);
                }
                if (data.gender !== undefined) {
                    const genderNode = doc.createElementNS(ns, 'Gender');
                    genderNode.textContent = data.gender;
                    langElt.appendChild(genderNode);
                }
                if (data.plural !== undefined) {
                    const pluralNode = doc.createElementNS(ns, 'Plural');
                    pluralNode.textContent = data.plural;
                    langElt.appendChild(pluralNode);
                }
            } else {
                // Simple structure
                langElt.textContent = newText;
            }

            textElt.appendChild(langElt);
        }

        return textElt;
    }

    public createXMLElement(tagName: string, content: string) {
        let xmlString = `<${tagName}>${content}
        </${tagName}>`
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, 'text/xml');
        return xml
    }

    /**
     * codeRussian
     */
    public codeRussian(text: string) {
        let result = this.russianDecoder.translateRuCiv(text)
        // console.log("text", text, result)
        return result;
    }


    /**
     * decodeRussian
     */
    public decodeRussian(text: string) {
        let result = this.russianDecoder.translateJavRu(text)
        // console.log("text", text, result)
        return result;
    }
}