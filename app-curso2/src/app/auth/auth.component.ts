import { PlaceholderDirective } from './../shared/placeholder/placeholder.directive';
import { Router } from '@angular/router';
import { AuthResponseData, AuthService } from './auth.service';
import { NgForm } from '@angular/forms';
import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from "@angular/core";
import { Observable, Subscription } from 'rxjs';
import { AlertComponent } from '../shared/alert/alert.component';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy{
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  @ViewChild(PlaceholderDirective, {static: false}) alertHost: PlaceholderDirective
  private closeSub: Subscription;

  constructor(private authService: AuthService,
    private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver){}

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }
  onSubmit(form: NgForm){
    // extra security to not send a form onSubmit if form is not corresponding correctly on browser
    if (!form.valid) {
      return;
    }

    const email = form.value.email;
    const password = form.value.password;
    this.isLoading = true;

    let authObservable: Observable<AuthResponseData>;

    if (this.isLoginMode) {
     authObservable = this.authService.login(email, password);
    }
    else {
     authObservable = this.authService.signUp(email, password)
    }

    authObservable.subscribe(
      responseData => {
      console.log(responseData);
      this.isLoading = false;
      this.router.navigate(['/recipes']);
    }, errorMessage => {
      console.log(errorMessage);
      this.error = errorMessage;
      this.showErrorAlert(errorMessage);
      this.isLoading = false;
    });

    form.reset();
  }

  onHandleError(){
    this.error = null;
  }

  ngOnDestroy(): void {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }

  private showErrorAlert(message: string) {
    // Essa abordagem para gerar o modal n vai funcionar.
    // const alertCmp = new AlertComponent();
    // para fazer isso é necessario urtilizar um component factory para gera o componente
    const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
    const hostVievContainerRef = this.alertHost.viewContainerRef;
    hostVievContainerRef.clear();
    const componentRef = hostVievContainerRef.createComponent(alertCmpFactory);
    componentRef.instance.message = message;
    this.closeSub = componentRef.instance.close.subscribe( () => {
      this.closeSub.unsubscribe();
      hostVievContainerRef.clear();
    } );
  }
}
