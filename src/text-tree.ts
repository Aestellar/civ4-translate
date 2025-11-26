import { CivText } from "./text-object";
import { RussianDecoder } from "./utils/russian_decoder";
export class TextTree {

    public textMap: Record<string, CivText>;
    xmlDocument: Node;
    xmlNS: string | null | undefined;
    russianDecoder: RussianDecoder

    constructor(xmlText: string) {
        this.russianDecoder = new RussianDecoder()
        const parser = new DOMParser();
        const xmlDocument = parser.parseFromString(xmlText, 'text/xml');
        this.xmlDocument = xmlDocument
        this.xmlNS = xmlDocument.querySelector("Civ4GameText")?.getAttribute("xmlns")
        const textElements = xmlDocument.querySelectorAll("Civ4GameText > TEXT")
        let textMap: Record<string, CivText> = {}
        for (let textElt of textElements) {
            let civText = new CivText(textElt, this.russianDecoder)
            textMap[civText.tagName] = civText
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