// src/types.ts

export interface XmlTextChild {
  type: 'text';
  content: string;
}

export interface XmlElementChild {
  tagName: string;
  children: (XmlElementChild | XmlTextChild)[];
}

// XmlObject represents any XML element (including the root)
export type XmlObject = XmlElementChild;

// Path is an array of indices navigating from root to a specific child
export type XmlPath = number[];

// Represents a discovered <TEXT Tag="..."> element in the tree
export interface TextElement {
  obj: XmlObject;       // The actual TEXT node object
  tag: string;          // Value of the "Tag" attribute
  path: XmlPath;        // Navigation path from root to this element
}