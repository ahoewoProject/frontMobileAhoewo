import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Proprietaire } from 'src/app/models/gestionDesComptes/Proprietaire';
import { PersonneService } from 'src/app/services/gestionDesComptes/personne.service';
import { ProprietaireService } from 'src/app/services/gestionDesComptes/proprietaire.service';

@Component({
  selector: 'app-proprietaires',
  templateUrl: './proprietaires.component.html',
  styleUrls: ['./proprietaires.component.css']
})
export class ProprietairesComponent {

  affichage = 1;

  elementsParPage = 5; // Nombre d'éléments par page
  pageActuelle = 0; // Page actuelle

  proprietaire = new Proprietaire();
  proprietaires : Proprietaire[] = [];
  messageSuccess: string | null = null;

  constructor(
    private proprietaireService: ProprietaireService,
    private personneService: PersonneService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.listeProprietaires();
  }

  listeProprietaires():void{
    this.proprietaireService.getAll().subscribe(
      (response) => {
        this.proprietaires = response;
      }
    );
  }

  // Récupération des propriétaires de la page courante
  get proprietairesParPage(): any[] {
    const startIndex = this.pageActuelle;
    const endIndex = startIndex + this.elementsParPage;
    return this.proprietaires.slice(startIndex, endIndex);
  }

  pagination(event: any) {
    this.pageActuelle = event.first;
    this.elementsParPage = event.rows;
    this.listeProprietaires()
  }

  voirListe(): void{
    this.listeProprietaires();
    this.affichage = 1;
  }

  detailProprietaire(id: number): void {
    console.log(id)
    this.proprietaireService.findById(id).subscribe(
      (response) => {
        this.proprietaire = response;
      }
    );
  }

  afficherPageDetail(id: number): void {
    this.detailProprietaire(id);
    this.affichage = 2;
  }

  deleteProprietaire(id: number): void{
    this.proprietaireService.deleteById(id).subscribe(
      (response) => {
        console.log(response);
        this.voirListe();
        this.messageSuccess = "Le propriétaire a été supprimé avec succès.";
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
