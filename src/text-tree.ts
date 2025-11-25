import { CivText } from "./text-object";
import { RussianDecoder } from "./utils/russian_decoder";
export class TextTree{
    public textMap: Record<string, CivText>;
    xmlDocument: Node;
    xmlNS: string | null | undefined;
    russianDecoder:RussianDecoder

    constructor(xmlText:string){  
        this.russianDecoder = new RussianDecoder()
        const parser = new DOMParser();
        const xmlDocument = parser.parseFromString(xmlText, 'text/xml');
        this.xmlDocument= xmlDocument
        this.xmlNS = xmlDocument.querySelector("Civ4GameText")?.getAttribute("xmlns")
        const textElements = xmlDocument.querySelectorAll("Civ4GameText > TEXT")
        let textMap: Record<string, CivText>={}
        for (let textElt of textElements){
            let civText = new CivText(textElt,this.russianDecoder)
            textMap[civText.tagName]=civText
        }
        this.textMap = textMap
    }

    public getNamespace(){
        return this.xmlNS
    }

    public xmlToString(): string {
        Object.entries(this.textMap).forEach(([, civText]) => {
           civText.updateXML()
        });
        const serializer = new XMLSerializer();
        return serializer.serializeToString(this.xmlDocument);
    }    

}