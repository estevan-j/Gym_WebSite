import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { EntrenadorService } from '../../../../services/Entrenador.service';
import { TabletUpdateComponent } from '../../ui/tablet-update/tablet-update.component';
import { SearchBarComponent } from '../../ui/search-bar/search-bar.component';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-actualizar-entrenador',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TabletUpdateComponent,
    SearchBarComponent,
    NgClass,
    NgIf,
  ],
  templateUrl: './actualizar-entrenador.component.html',
})
export class ActualizarEntrenadorComponent {
  formulario!: FormGroup;
  datos: any = [];
  dataFiltered: any = [];
  currentData: any = {};
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private _entrenadorService: EntrenadorService,
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.formulario = this.formBuilder.group(
      {
        direccion: [''],
        telefono: ['', Validators.pattern('^[0-9]*$')],
        correo: ['', [Validators.email]],
        activo: [''],
        especialidad: [''],
      },
      { validators: this.atLeastOneFieldValidator() }
    );
  }

  ngOnInit(): void {
    this.loadEntrenadores();
  }

  private loadEntrenadores(): void {
    this._entrenadorService.getEntrenadores().subscribe(
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
      this.dataFiltered = this.datos.filter((entrenador: any) =>
        searchPattern.test(entrenador.cedula)
      );
    }
  }

  receiveRow(row: any) {
    this.currentData = row;
    this.formulario.patchValue({
      direccion: Object.values(row.direccion).join(', '),
      telefono: row.telefono,
      correo: row.correo,
      activo: row.activo,
      especialidad: row.especialidad,
    });
  }

  onSubmit() {
    if (this.formulario.valid) {
      const formData = {
        ...this.currentData,
        telefono: this.formulario.value.telefono || this.currentData.telefono,
        correo: this.formulario.value.correo || this.currentData.correo,
        direccion: {
          ciudad: this.formulario.value.direccion || '',
          callePrincipal: '',
          calleSecundaria: '',
        },
        activo: this.formulario.value.activo || this.currentData.activo,
        especialidad:
          this.formulario.value.especialidad || this.currentData.especialidad,
      };
      delete formData.entrenamientos;
      console.log(formData);

      this._entrenadorService.actualizarEntrenador(formData).subscribe(
        (response) => {
          console.log('Datos Actualizados correctamente', response);
          this.successMessage = 'Datos Actualizados correctamente';
          this.errorMessage = '';
          this.formulario.reset();
          this.initializeForm();
          this.hideMessagesAfterTimeout();
          this.loadEntrenadores();
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
