import { Component, OnInit } from '@angular/core';
import { TabletUpdateComponent } from '../../ui/tablet-update/tablet-update.component';
import { SearchBarComponent } from '../../ui/search-bar/search-bar.component';
import { EntrenamientoService } from '../../../../services/Entrenamiento.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { EntrenadorService } from '../../../../services/Entrenador.service';

@Component({
  selector: 'app-gestionar-entrenamientos',
  standalone: true,
  imports: [ReactiveFormsModule,SearchBarComponent, TabletUpdateComponent, NgIf, NgClass],
  templateUrl: './gestionar-entrenamientos.component.html',
})
export class GestionarEntrenamientosComponent implements OnInit {
  formulario!: FormGroup;
  datos: any = [];
  dataFiltered: any = [];
  currentData: any = {};
  successMessage: string = '';
  errorMessage: string = '';
  entrenadorOptions: any;

  constructor(
    private formBuilder: FormBuilder ,
    private _entrenamientoService: EntrenamientoService,
    private _trainerService: EntrenadorService
  ) {
    this.initializeForm();
    this._trainerService.getEntrenadores().subscribe(
      (response) => {
        this.entrenadorOptions = response;
        console.log(this.entrenadorOptions);
      },
      (error) => {
        console.error('Error al cargar los datos:', error);
      }
    );
  }

  
  private initializeForm(): void {
    this.formulario = this.formBuilder.group(
      {
        duracion: ['', Validators.pattern('^[0-9]*$')],
        intensidad: [''],
        descripcion: [''],
        activo: [''],
      },
      { validators: this.atLeastOneFieldValidator() }
    );
  }

  ngOnInit(): void {
    this.loadEntrenamientos();
  }

  private loadEntrenamientos(): void {
    this._entrenamientoService.getEntrenamientos().subscribe(
      (response) => {
        this.datos = response;
        this.dataFiltered = response;
      },
      (error) => {
        console.error('Error al cargar los datos:', error);
      }
    );
  }

  atLeastOneFieldValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formGroup = control as FormGroup;
      const controls = formGroup.controls;
      const hasValue = Object.keys(controls).some((key) => controls[key].value);
      return hasValue ? null : { atLeastOneFieldRequired: true };
    };
  }

  showError(controlName: string): boolean {
    const control = this.formulario.get(controlName);
    return control ? control.invalid && control.touched : false;
  }

  receiveSearchText(text: string) {
    const searchText = text.trim().toLowerCase();
    if (searchText === '') {
      this.dataFiltered = [...this.datos];
    } else {
      const searchPattern = new RegExp(searchText, 'i');
      this.dataFiltered = this.datos.filter((entrenamiento: any) =>
        searchPattern.test(entrenamiento.nombre)
      );
    }
  }

  receiveRow(row: any) {
    this.currentData = row;
    this.formulario.patchValue({
      duracion: row.duracion,
      descripcion: row.descripcion,
    });
  }

  onSubmit() {
    if (this.formulario.valid) {
      const formData = {
        ...this.currentData,
        descripcion: this.formulario.value.descripcion || this.currentData.descripcion,
        duracion: this.formulario.value.duracion ? parseInt(this.formulario.value.duracion, 10) : this.currentData.duracion,
        entrenador: {
          cedula: this.currentData.entrenador.cedula,
        }
      };
      this._entrenamientoService.actualizarEntrenamiento(formData).subscribe(
        (response) => {
          console.log('Datos Actualizados correctamente', response);
          this.successMessage = 'Datos Actualizados correctamente';
          this.errorMessage = '';
          this.formulario.reset();
          this.initializeForm();
          this.hideMessagesAfterTimeout();
          this.loadEntrenamientos();
        },
        (error) => {
          this.errorMessage = 'Error al actualizar los datos: ' + error.message;
          this.successMessage = '';
          this.hideMessagesAfterTimeout();
        }
      );
    } else {
      console.error('El formulario no es válido');
      this.errorMessage =
        'El formulario no es válido. Por favor, revise los campos.';
      this.successMessage = '';
      this.hideMessagesAfterTimeout();
    }
  }

  private hideMessagesAfterTimeout(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  } 
}
