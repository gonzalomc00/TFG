import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { HashService } from '../services/hash.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string;
  password: string;
  modo:string="login"
  errorLogin:boolean=false

  constructor(private userService: UserService, private auth: AuthService
    ,private route: ActivatedRoute,private router:Router, private hashService: HashService){

      if (this.auth.userValue) { 
        this.router.navigate(['/home']);

  }
}


  login(){

    
    this.auth.signin(this.email,this.password).subscribe({
      next: (response) => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigate([returnUrl]);
   
      },
      error: (error: any) => this.errorLogin=true,

    }) 
  }
  
  register(){
    this.router.navigate(['register'])
  }
  

}




