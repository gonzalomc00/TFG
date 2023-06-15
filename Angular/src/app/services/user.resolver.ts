import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from './user.service';

//Este Resolver evitará cargar una pagina HTML hasta que tengamos la respuesta
//que nos proporciona al usuario y, por tanto, la información que debemos mostrar
//por pantalla

@Injectable({providedIn: 'root'})
export class UserResolver implements Resolve<Response> {
 
  constructor(private userService: UserService){

  }
 
  //Queremos decirle a nuestra app que no vaya a la vista hasta que no se resuelva el resolver 
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Response> {
    return this.userService.getUser(route.paramMap.get('uuid')!)
  }
}
