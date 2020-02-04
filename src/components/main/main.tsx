import * as React from 'react';
import './main.css';

import { ICompany, IStudent } from '../../models/models'

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


    render() {

        let phase3Students = this.state.students.filter((s: IStudent) => !s.priznavanje && !s.nasaoSam && !s.prihvaceno);
        return (<div>
            <h1>Stručne prakse - faza 3</h1>
            {
                this.state.companies.map((it: ICompany) => (
                    <div key={it.naziv} className="company-main-container">
                        {it.naziv} ({it.brojPraksi}) - slobodno još ({it.brojPraksi - this.state.students.filter((s: IStudent) => s.prihvaceno && s.prihvacenaFirma === it.id).length})
                        {
                            phase3Students && phase3Students.length &&
                            <div className="company-inner-container">
                                {
                                    phase3Students
                                        .filter((s: IStudent) => s.odabir1 === it.id || s.odabir2 === it.id || s.odabir3 === it.id)
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
                                        .map((s: IStudent) => (
                                            <div key={s.brIndeksa}>
                                                {s.ime} {s.prezime} <b>{s.prosjek}</b> {s.odabir1 === it.id ? "(1)" : null} {s.odabir2 === it.id ? "(2)" : null} {s.odabir3 === it.id ? "(3)" : null}
                                            </div>
                                        ))
                                }
                            </div>
                        }
                    </div>
                ))
            }
            <br />

            <h1>Nasli sami</h1>
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
                        {i + 1}. {it.ime} {it.prezime}
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
            <h1>Neraspodijeljeno</h1>
            {
                this.state.students.filter(it => !it.prihvaceno && !it.priznavanje && !it.nasaoSam).map((it: IStudent, i) => (
                    <div key={it.brIndeksa}>
                        {i + 1}. {it.ime} {it.prezime}
                    </div>
                ))
            }
        </div>);
    }
}

export default Main;