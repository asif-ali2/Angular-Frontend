import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private http: HttpClient, private modalService: BsModalService, private fb:FormBuilder){}
  title = 'Book-app';
  data: any[] = [];
  modalRef?: BsModalRef;
  addBookForm: FormGroup;
  formSubmit:boolean = false;
  isEdit: boolean = false;
  globalId: "";
  ngOnInit() {
    this.getAllData();
    this.formBuilder();
    
  }
  getAllData(){
    this.http.get('http://localhost:3000/api/v1/getAllBook').subscribe((result: any)=>{
      this.data = result['data'];
    })
  }

  formBuilder(){
    this.addBookForm = this.fb.group({
      title: new FormControl("", [Validators.required]),
      author: new FormControl("", [Validators.required]),
      description: new FormControl("", [Validators.required]),
      public_year: new FormControl("", [Validators.required]),
      isbn: new FormControl("", [Validators.required])
    })
  }

  openModal(template: TemplateRef<void>) {
    this.isEdit = false;
    this.modalRef = this.modalService.show(template);
  }

  getFormValue(){
    this.formSubmit = true;
    if(!this.addBookForm.valid){
      return;
    }
    let payload = {
      title: this.addBookForm.value.title,
      author: this.addBookForm.value.author,
      description: this.addBookForm.value.description,
      public_year: this.addBookForm.value.public_year,
      isbn: this.addBookForm.value.isbn
    }
    if(this.isEdit){
      this.http.put(`http://localhost:3000/api/v1/book/${this.globalId}`, payload).subscribe((result)=>{
        if(result['success']){
          this.addBookForm.reset();
          this.modalRef.hide();
          this.formSubmit = false;
          this.getAllData();
        }
      })
    }else{
      this.http.post('http://localhost:3000/api/v1/addBook', payload).subscribe((result)=>{
        if(result['success']){
          this.addBookForm.reset();
          this.modalRef.hide();
          this.formSubmit = false;
          this.getAllData();
        }
      })
    }
  }
  get addForm(){
    return this.addBookForm.controls;
  }

  deleteItem(id: any){
    this.http.delete(`http://localhost:3000/api/v1/book/${id}`).subscribe((result)=>{
      if(result['success']){
        this.getAllData();
      }
    })
  }

  editItem(id: any, template: any){
    this.isEdit= true;
    this.globalId = id;
    this.http.get(`http://localhost:3000/api/v1/book/${id}`).subscribe((result: any)=>{
      if(result['success']){
        this.addBookForm = this.fb.group({
          title: new FormControl(result.data.title? result.data.title:"", [Validators.required]),
          author: new FormControl(result.data.author? result.data.author:"", [Validators.required]),
          description: new FormControl(result.data.description? result.data.description:"", [Validators.required]),
          public_year: new FormControl(result.data.publicYear? result.data.publicYear:"", [Validators.required]),
          isbn: new FormControl(result.data.isbn? result.data.isbn:"", [Validators.required])
        });
        this.modalRef = this.modalService.show(template);
      }
    })
  }
}
