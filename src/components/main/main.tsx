import * as React from 'react';
import './main.css';
import { ICompany, IStudent } from '../../models/models';
var FileSaver = require('file-saver');

declare var DocxReader: any;

export interface MainProps {

}

export interface MainState {
    students: IStudent[];
    companies: ICompany[];
}

class Main extends React.Component<MainProps, MainState> {
    private currentYear: number;

    constructor(props: MainProps) {
        super(props);
        const d = new Date();
        this.currentYear = d.getFullYear();

        this.state = {
            students: [],
            companies: [],
        };
    }

    async loadStudentsData() {
        let students = await import(`../../data/${this.currentYear}/studenti.json`);
        students = students.studenti.map((s: IStudent) => {
            s.duljinaStudiranja = +s.duljinaStudiranja;
            s.prosjek = +s.prosjek;
            return s;
        })
        students = students.map((s: IStudent) => {
            s.tezinskiFaktor = s.prosjek;
            if (s.duljinaStudiranja > 3) s.tezinskiFaktor = s.tezinskiFaktor - ((s.duljinaStudiranja - 3) / 2);
            return s;
        })

        this.setState({
            students: students,
        })
    }

    async loadCompaniesData() {
        let companies = await import(`../../data/${this.currentYear}/nastavnaBaza.json`);
        this.setState({
            companies: companies.firme,
        })
    }

    componentDidMount() {
        this.loadStudentsData();
        this.loadCompaniesData();
    }


    executeDocx(firmaNaziv: string, firmaAdresa:string, studentIme: string, brIndeksa: string) {
        var docx = new DocxReader();
        docx.Load("/templates/uputnica.docx", function () {

            // Replace
            docx.Replace("FIRMA_NAZIV", firmaNaziv);
            docx.Replace("FIRMA_ADRESA", firmaAdresa);
            docx.Replace("IME_STUDENTA", studentIme);
            docx.Replace("MATICNI_BROJ", brIndeksa);

            // Change var inside document
            var docxvar = {
                Variable: "Change my var inside doc"
            };

            docx.docxtemplater.setData(docxvar);

            try {
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                docx.docxtemplater.render();
            }
            catch (error) {
                var e = {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    properties: error.properties,
                }
                console.log(JSON.stringify({ error: e }));
                // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
                throw error;
            }

            // Change file name
            docx.SetName("Uputnica " + studentIme + ".docx")

            // Download
            let download = docx.Download();
            FileSaver.saveAs(download.out, studentIme + " uputnica.docx");

        });
    }

    generateUputnice() {
        this.state.students.filter(it => it.prihvaceno).map((student: IStudent, i) => {
            let firma = this.state.companies.find(f => f.id === student.prihvacenaFirma);
            const firmaNaziv: string = "" + firma?.naziv;
            const firmaAdresa: string = "Nepoznato";
            const studentIme: string = student.ime + " " + student.prezime;
            const brIndeksa: string = student.brIndeksa;
            this.executeDocx(firmaNaziv, firmaAdresa, studentIme, brIndeksa)
        });
    }


    render() {

        let phase3Students = this.state.students.filter((s: IStudent) => !s.priznavanje && !s.nasaoSam && !s.prihvaceno);
        return (<div>
            <h1>Stručne prakse - faza 3</h1>
            {
                this.state.companies.map((it: ICompany) => {
                    let x = it.brojPraksi - this.state.students.filter((s: IStudent) => s.prihvaceno && s.prihvacenaFirma === it.id).length - this.state.students.filter((s: IStudent) => s.prisilnoDodijeljeno && s.prisilnoDodijeljenoFirma === it.id).length;
                    return x > 0 ? (
                        <div key={it.naziv} className="company-main-container">
                            {it.naziv} ({it.brojPraksi}) - <i>{it.email}</i> - slobodno još ({it.brojPraksi - this.state.students.filter((s: IStudent) => s.prihvaceno && s.prihvacenaFirma === it.id).length - this.state.students.filter((s: IStudent) => s.prisilnoDodijeljeno && s.prisilnoDodijeljenoFirma === it.id).length}) {it.poslanMail ? <b style={{ color: "green" }}>MAIL</b> : <b style={{ color: "rgba(0,0,0,0.1)" }}>MAIL</b>}
                            {
                                phase3Students && phase3Students.length &&
                                <div className="company-inner-container">
                                    {
                                        phase3Students
                                            .filter((s: IStudent) => s.odabir1 === it.id || s.odabir2 === it.id || s.odabir3 === it.id)
                                            .filter((it: IStudent) => !it.prihvaceno && !it.priznavanje && !it.nasaoSam && !it.prisilnoDodijeljeno)
                                            .map((s: IStudent) => {
                                                if (s.odabir1 === it.id) s.tezinskiFaktor = s.tezinskiFaktor * 1.3;
                                                else if (s.odabir2 === it.id) s.tezinskiFaktor = s.tezinskiFaktor * 1.2;
                                                else if (s.odabir3 === it.id) s.tezinskiFaktor = s.tezinskiFaktor * 1.1;
                                                s.tezinskiFaktor = +s.tezinskiFaktor.toFixed(3);
                                                return s;
                                            })
                                            .sort((a: any, b: any) => {
                                                return b.tezinskiFaktor - a.tezinskiFaktor;
                                            })
                                            .map((s: IStudent, i) => {
                                                let ispis = <span>{i + 1}. {s.ime} {s.prezime} <b>{s.prosjek}</b> {s.odabir1 === it.id ? "(1)" : null} {s.odabir2 === it.id ? "(2)" : null} {s.odabir3 === it.id ? "(3)" : null} email: <i>{s.email}</i> </span>
                                                // let ispis = <span> {i+1}. {s.ime} {s.prezime} email: <i>{s.email}</i></span>;
                                                return (
                                                    <div key={s.brIndeksa}>
                                                        {(s.forceRemoveOdabir1 && s.odabir1 === it.id) || (s.forceRemoveOdabir2 && s.odabir2 === it.id) || (s.forceRemoveOdabir3 && s.odabir3 === it.id) ? <del>{ispis}</del> : ispis}
                                                    </div>
                                                )
                                            })
                                    }
                                </div>
                            }
                        </div>)
                        :
                        <div className="firmaDone">{it.naziv}</div>
                })
            }
            <br />

            <h1>Našli sami</h1>
            {
                this.state.students.filter(it => it.nasaoSam).map((it: IStudent, i) => (
                    <div key={it.brIndeksa}>
                        {i + 1}. {it.ime} {it.prezime}
                    </div>
                ))
            }
            <h1>Priznavanje</h1>
            {
                this.state.students.filter(it => it.priznavanje).map((it: IStudent, i) => (
                    <div key={it.brIndeksa}>
                        {i + 1}. {it.ime} {it.prezime} {/*it.email*/}
                    </div>
                ))
            }
            <h1>Prihvaćeno</h1>
            {
                this.state.students.filter(it => it.prihvaceno).map((it: IStudent, i) => (
                    <div key={it.brIndeksa}>
                        {i + 1}. {it.ime} {it.prezime} - {this.state.companies.filter((c: ICompany) => c.id === it.prihvacenaFirma).map(c => c.naziv)}
                    </div>
                ))
            }
            <h1>Raspodijeljeno</h1>
            {
                this.state.students.sort((a: any, b: any) => {
                    return b.prosjek - a.prosjek;
                }).filter(it => it.prisilnoDodijeljeno).map((it: IStudent, i) => (
                    <div key={it.brIndeksa}>
                        {i + 1}. {it.ime} {it.prezime} - {this.state.companies.filter((c: ICompany) => c.id === it.prisilnoDodijeljenoFirma).map(c => c.naziv)}
                    </div>
                ))
            }
            <h1>Neraspodijeljeno</h1>
            {
                this.state.students.sort((a: any, b: any) => {
                    return b.prosjek - a.prosjek;
                }).filter(it => !it.prihvaceno && !it.priznavanje && !it.nasaoSam && !it.prisilnoDodijeljeno).map((it: IStudent, i) => (
                    <div key={it.brIndeksa}>
                        {i + 1}. {it.ime} {it.prezime} ({it.prosjek}) {it.odabir1 == 0 && it.odabir2 == 0 && it.odabir3 == 0 && <b> FALI ANKETA !!!</b>}
                    </div>
                ))
            }

            <button onClick={() => this.generateUputnice()}>Generiraj uputnice</button>

        </div>);
    }
}

export default Main;