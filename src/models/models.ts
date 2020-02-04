export interface ICompany{
    id: number;
    naziv: string;
    brojPraksi: number;
    razgovor: boolean;
}

export interface IStudent{
    prezime: string,
    ime: string,
    brIndeksa: number,
    email: string,
    imeStudija: string,
    prosjek: number,
    duljinaStudiranja: number,
    odabir1: number,
    odabir2: number,
    odabir3: number,
    nasaoSam: boolean,
    priznavanje: boolean,
    tezinskiFaktor: number,
    prihvaceno?: boolean,
    prihvacenaFirma?: number,
}