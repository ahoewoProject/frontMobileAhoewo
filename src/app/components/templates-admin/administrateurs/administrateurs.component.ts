import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Administrateur } from 'src/app/models/gestionDesComptes/Administrateur';
import { Role } from 'src/app/models/gestionDesComptes/Role';
import { AdministrateurService } from 'src/app/services/gestionDesComptes/administrateur.service';
import { PersonneService } from 'src/app/services/gestionDesComptes/personne.service';

@Component({
  selector: 'app-administrateurs',
  templateUrl: './administrateurs.component.html',
  styleUrls: ['./administrateurs.component.css']
})
export class AdministrateursComponent implements OnInit {

  affichage = 1;
  visibleAddForm = 0;
  visibleUpdateForm = 0;

  elementsParPage = 5; // Nombre d'éléments par page
  pageActuelle = 0; // Page actuelle

  erreur: boolean = false;
  admin = this.adminService.administrateur;
  administrateurs : Administrateur[] = [];
  messageErreur: string = "";
  messageSuccess: string | null = null;

  adminForm: any;
  roleAdmin: Role = {
    id: 1,
    code: 'ROLE_ADMIN',
    libelle: 'Administrateur',
    creerPar: 0,
    creerLe: new Date(),
    modifierPar: 0,
    modifierLe: new Date(),
    statut: false
  }

  constructor(
    private adminService: AdministrateurService,
    private personneService: PersonneService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.listeAdmins();
    this.initAdminForm()
  }

  initAdminForm(): void{
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    this.adminForm = new FormGroup({
      nom: new FormControl(this.admin.nom, [Validators.required]),
      prenom: new FormControl(this.admin.prenom, [Validators.required]),
      username: new FormControl(this.admin.username, [Validators.required]),
      email: new FormControl(this.admin.email, [Validators.required, Validators.email, Validators.pattern(emailRegex)]),
      motDePasse: new FormControl(this.admin.motDePasse, [Validators.required, Validators.maxLength(14), Validators.minLength(8), Validators.pattern(passwordRegex)]),
      telephone: new FormControl(this.admin.telephone, [Validators.required]),
    })
  }

  listeAdmins():void{
    this.adminService.getAll().subscribe(
      (response) => {
        this.administrateurs = response;
      }
    );
  }

  // Récupération des admins de la page courante
  get administrateursParPage(): any[] {
    return this.administrateurs.slice(this.pageActuelle, this.elementsParPage + this.pageActuelle);
  }

  pagination(event: any) {
    this.pageActuelle = event.first;
    this.elementsParPage = event.rows;
    this.listeAdmins()
  }

  voirListe(): void{
    this.listeAdmins();
    this.adminForm.reset();
    this.affichage = 1;
    this.visibleAddForm = 0;
    this.visibleUpdateForm = 0;
    this.erreur = false;
  }


  afficherFormulaireAjouter(): void {
    this.visibleAddForm = 1;
    this.visibleUpdateForm = 0;
    this.admin = new Administrateur();
  }

  detailAdmin(id: number): void {
    this.adminService.findById(id).subscribe(
      (response) => {
        this.admin = response;
      }
    );
  }

  afficherPageDetail(id: number): void {
    this.detailAdmin(id);
    this.affichage = 3;
    this.visibleAddForm = 0;
    this.visibleUpdateForm = 0;
  }

  afficherFormulaireModifier(id: number): void {
    this.detailAdmin(id);
    this.visibleUpdateForm = 1;
    this.visibleAddForm = 0;
  }

  get nom(){
    return this.adminForm.get('nom');
  }

  get prenom(){
    return this.adminForm.get('prenom');
  }

  get username(){
    return this.adminForm.get('username');
  }

  get email(){
    return this.adminForm.get('email');
  }

  get motDePasse(){
    return this.adminForm.get('motDePasse');
  }

  get telephone(){
    return this.adminForm.get('telephone');
  }

  ajouterAdmin(): void {
    this.admin.role = this.roleAdmin;

    this.adminService.addAdministrateur(this.admin).subscribe(
      (response) =>{
        console.log(response);
        if(response.id > 0) {
          this.administrateurs.push({
            id: response.id,
            nom: response.nom,
            prenom: response.prenom,
            username: response.username,
            email: response.email,
            motDePasse: response.motDePasse,
            telephone: response.telephone,
            etatCompte: response.etatCompte,
            role: response.role,
            creerLe: response.creerLe,
            creerPar: response.creerPar,
            modifierLe: response.modifierLe,
            modifierPar: response.modifierPar,
            statut: response.statut,
            estCertifie: false,
            resetToken: ''
          });
          this.voirListe();
          this.messageSuccess = "L'administrateur a été ajouté avec succès.";
          this.messageService.add({ severity: 'success', summary: 'Ajout réussi', detail: this.messageSuccess })
        }
        else{
          this.erreur = true;
          this.messageErreur = "Erreur lors de l'ajout de l'administrateur !"
          this.afficherFormulaireAjouter();
          this.admin.nom = response.nom;
          this.admin.prenom = response.prenom;
          this.admin.username = response.username;
          this.admin.email = response.email;
          this.admin.telephone = response.telephone;
          this.messageService.add({ severity: 'error', summary: "Erreur d'ajout", detail: this.messageErreur });
        }
    },
    (error) =>{
      console.log(error)
      if(error.status === 409){
        this.erreur = true;
        this.messageErreur = "Un administrateur avec ce nom d'utilisateur existe déjà !";
        this.messageService.add({ severity: 'warn', summary: 'Ajout non réussi', detail: this.messageErreur });
      }
    })
  }

  deleteAdmin(id: number): void{
    this.adminService.deleteById(id).subscribe(
      (response) => {
        console.log(response);
        this.voirListe();
        this.messageSuccess = "L'administrateur a été supprimé avec succès.";
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
