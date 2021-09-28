import { AdrItem } from '@cpdm-model/general-compliances/accessibility/identify-adrs/adrItems/adrItems.model';

export default class AdrMemo {
    web = [];
    software = [];
    hardware = [];
    documentation = [];
    webSelected = [];
    softwareSelected = [];
    hardwareSelected = [];
    documentationSelected = [];
    webNotSelected = [];
    softwareNotSelected = [];
    hardwareNotSelected = [];
    documentationNotSelected = [];

    constructor() { }

    setItem(itemName: string, adrItems: AdrItem []) {
        this[itemName] = [...adrItems];
    }

    setNotSelectedItem(itemName: string, adrItems: AdrItem []) {
        this[`${itemName}NotSelected`] = [...adrItems];
    }

    setSelectedItem(itemName: string, adrItems: AdrItem []) {
        this[`${itemName}Selected`] = [...adrItems];
    }

    getItems(itemName: string) {
        return [...this[itemName]];
    }

    getSelectedItems(itemName: string) {
        return [...this[`${itemName}Selected`]];
    }

    getNotSelectedItems(itemName: string) {
        return [...this[`${itemName}NotSelected`]];
    }
}