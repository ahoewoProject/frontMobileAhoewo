import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Demarcheur } from 'src/app/models/gestionDesComptes/Demarcheur';
import { DemarcheurService } from 'src/app/services/gestionDesComptes/demarcheur.service';
import { PersonneService } from 'src/app/services/gestionDesComptes/personne.service';

@Component({
  selector: 'app-demarcheurs',
  templateUrl: './demarcheurs.component.html',
  styleUrls: ['./demarcheurs.component.css']
})
export class DemarcheursComponent implements OnInit{

  affichage = 1;

  elementsParPage = 5; // Nombre d'éléments par page
  pageActuelle = 0; // Page actuelle

  demarcheur = new Demarcheur();
  demarcheurs : Demarcheur[] = [];
  messageSuccess: string | null = null;

  constructor(
    private demarcheurService: DemarcheurService,
    private personneService: PersonneService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.listeDemarcheurs();
  }

  listeDemarcheurs():void{
    this.demarcheurService.getAll().subscribe(
      (response) => {
        this.demarcheurs = response;
      }
    );
  }

  // Récupération des démarcheurs de la page courante
  get demarcheursParPage(): any[] {
    const startIndex = this.pageActuelle;
    const endIndex = startIndex + this.elementsParPage;
    return this.demarcheurs.slice(startIndex, endIndex);
  }

  pagination(event: any) {
    this.pageActuelle = event.first;
    this.elementsParPage = event.rows;
    this.listeDemarcheurs()
  }

  voirListe(): void{
    this.listeDemarcheurs();
    this.affichage = 1;
  }

  detailDemarcheur(id: number): void {
    this.demarcheurService.findById(id).subscribe(
      (response) => {
        this.demarcheur = response;
      }
    );
  }

  afficherPageDetail(id: number): void {
    this.detailDemarcheur(id);
    this.affichage = 2;
  }

  deleteDemarcheur(id: number): void{
    this.demarcheurService.deleteById(id).subscribe(
      (response) => {
        console.log(response);
        this.voirListe();
        this.messageSuccess = "Le démarcheur a été supprimé avec succès.";
        this.messageService.add({ severity: 'success', summary: 'Suppression réussie', detail: this.messageSuccess })
      }
    );
  }

  activerCompte(event: any, id: number): void{
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Vous êtes sûr de vouloir activer ce compte ?',
      header: "Activation de compte",
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: "Oui",
      rejectLabel: "Non",
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      accept: () => {
        this.personneService.activerCompte(id).subscribe(response=>{
          console.log(response);
          this.voirListe();
          this.messageSuccess = "Le compte a été activé avec succès !";
          this.messageService.add({ severity: 'success', summary: 'Activation de compte confirmé', detail: this.messageSuccess })
        });

      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Activation de compte rejetée', detail: "Vous avez rejeté l'activation de ce compte !" });
      }
    });
  }

  desactiverCompte(event: any, id: number): void{
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Vous êtes sûr de vouloir désactiver ce compte ?',
      header: "Désactivation de compte",
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: "Oui",
      rejectLabel: "Non",
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      accept: () => {
        this.personneService.desactiverCompte(id).subscribe(response=>{
          console.log(response);
          this.voirListe();
          this.messageSuccess = "Le compte a été désactivé avec succès.";
          this.messageService.add({ severity: 'success', summary: 'Désactivaction de compte confirmé', detail: this.messageSuccess })
        });

      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Désactivation de compte rejetée', detail: 'Vous avez rejeté la désactivation de ce compte !' });
      }
    });
  }
}
