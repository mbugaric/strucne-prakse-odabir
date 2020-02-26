export interface ICompany{
    id: number;
    naziv: string;
    email: string;
    brojPraksi: number;
    razgovor: boolean;
    poslanMail: boolean;
}

export interface IStudent{
    prezime: string,
    ime: string,
    brIndeksa: string,
    email: string,
    imeStudija: string,
    prosjek: number,
    duljinaStudiranja: number,
    odabir1: number,
    forceRemoveOdabir1: boolean,
    odabir2: number,
    forceRemoveOdabir2: boolean,
    odabir3: number,
    forceRemoveOdabir3: boolean,
    nasaoSam: boolean,
    priznavanje: boolean,
    tezinskiFaktor: number,
    prihvaceno?: boolean,
    prihvacenaFirma?: number,
    nijeIspunioAnketu?: boolean,
    prisilnoDodijeljeno?: boolean,
    prisilnoDodijeljenoFirma?: number,
}