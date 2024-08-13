import { Component, OnInit } from '@angular/core';
import { MembresiaService } from '../../../../services/Membresia.service';
import { TabletUpdateComponent } from '../../ui/tablet-update/tablet-update.component';
import { EntrenamientoService } from '../../../../services/Entrenamiento.service';
import { SearchBarComponent } from '../../ui/search-bar/search-bar.component';
import { TabletDeleteComponent } from '../../ui/tablet-delete/tablet-delete.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-gestionar-membresia',
  standalone: true,
  imports: [TabletDeleteComponent, SearchBarComponent, NgIf],
  templateUrl: './gestionar-membresia.component.html',
})
export class GestionarMembresiaComponent implements OnInit {
  datos: any = [];
  dataFiltered: any = [];
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private _membresiaService: MembresiaService
  ) {
  }

  ngOnInit(): void {
    this._membresiaService.getMembresias().subscribe(
      (response) => {
        this.datos = response;
        this.dataFiltered = response; 
      },
      (error) => {
        console.error('Error al cargar los datos:', error);
      }
    );
  }

  receiveSearchText(text: string) {
    const searchText = text.trim().toLowerCase();
    if (searchText === '') {
      this.dataFiltered = [...this.datos]; 
    } else {
      const searchPattern = new RegExp(searchText, 'i'); 
      this.dataFiltered = this.datos.filter(
        (membresia: any) =>
          searchPattern.test(membresia.cedula) 
      );
    }
  }

  private hideMessagesAfterTimeout(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000); 
  }

  deleteRow(membresia: any): void {
    console.log(membresia.cedula);
    
    this._membresiaService.deleteMembresia(membresia.idMembresia).subscribe(
      (response) => {
        this.successMessage = 'Membresía eliminada correctamente';
        this.hideMessagesAfterTimeout();
        this.datos = this.datos.filter(
          (memb: any) => {
            return memb.idMembresia !== membresia.idMembresia;
          }
        );
        this.dataFiltered = this.datos;
        console.log(this.dataFiltered);
        
      },
      (error) => {
        this.errorMessage = 'Error al eliminar la membresía: ' + error.message;
        this.hideMessagesAfterTimeout();
      }
    );
  }
}
