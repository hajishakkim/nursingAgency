import { Component, OnInit, ViewChild } from '@angular/core';
import {FormGroup, FormBuilder } from '@angular/forms';
import { VacanciesFormComponent } from '../vacancies-form/vacancies-form.component';
import { ApiService } from '../../services/api.service'
import {Vaccancies} from '../vaccancies.model';
import * as $ from 'jquery';

declare function setDataTable(options:any,table: string): void;
declare function fixedHeaderTable(ele:any): void;
declare function refreshSelectpicker(): void;

@Component({
  selector: 'app-vacancies-list',
  templateUrl: './vacancies-list.component.html',
  styleUrls: ['./vacancies-list.component.css']
})
export class VacanciesListComponent implements OnInit {
  vacancy_data: Vaccancies[] = [];
  headers: string[];
  row_count   : 0;
  row_per_page : number;
  page : number;
  formData : {};
  totalPages :number;
  totalPagesArr : [];
  @ViewChild('app_vacancies_form', {static: false}) app_vacancies_form:VacanciesFormComponent;
  log: any;
  advanced_filter_search : boolean = false;
  list_items_data : [];
  form: FormGroup;  
  vaccancy : {};
  constructor(public API: ApiService,builder: FormBuilder) {
      this.vaccancy = new Vaccancies();
      //console.log(this.vaccancy);
      this.form = builder.group(this.vaccancy)
  }

  ngOnInit() {
      var data = [];
      this.getVaccanies({data:[]},1,10);
      this.getListItems();
      //setDataTable(null,'');
  }
  
  ngAfterContentInit(){  
  }  
  showSearch(){    
    this.advanced_filter_search = (this.advanced_filter_search) ? false : true;
    return;
  }
  saveForm(formData: Vaccancies) {
    this.API.post('vaccancies.php',{data:formData,'action':'save'})
    .subscribe(data => {
      if(data.status == "success") {
        this.vacancy_data.push(formData);   
      }else{

      }
    });
  }
  getListItems(){
    var data = {
      'request_items': {
        'list_items': ['shift_type'],
        'modules': ['client','business_unit','jobs'],
      }
    };
    this.API.post('vaccancies.php',data)
    .subscribe(data => {
      this.list_items_data = data;
      setTimeout(function(){
        refreshSelectpicker();
      },1000)
    });
  }
  getVaccanies(data:any,page_no=0,row_per_page=0) {
    data.page = page_no;
    data.row_per_page = row_per_page;
    data.totalPagesArr = [];
    this.API.post('vaccancies.php',data)
    .subscribe(data => {
      this.vacancy_data = data.data;
      this.row_count = data.totalCnt;
      this.page = page_no;
      this.row_per_page = row_per_page;
      this.totalPagesArr = data.totalPagesArr; 
      fixedHeaderTable($('.listing-table-wrapper'));
    });    
  }
  
  getCurrentPage(rows: 0,from=''){
     this.page = from == "rpp" ? 1 : rows;
     this.row_per_page = from == "rpp" ?  rows : this.row_per_page;
     this.getVaccanies({data:this.vaccancy,action:'search'},this.page,this.row_per_page);
    }
  formSubmit(){
    this.app_vacancies_form.saveForm();
  }
  editItem(item:any){    
    this.app_vacancies_form.editItem(item);
  }
  showAdvancedSearch(){
    this.advanced_filter_search = (this.advanced_filter_search) ? false: true;
  }
  filterSearch(){
    this.getVaccanies({data:this.vaccancy,action:'search'},1,this.row_per_page);
  }
  clearSearch(){
    this.form.reset();
    refreshSelectpicker();
  }
  showClientName(client_id){    
    var client = this.list_items_data['modules']['client'].filter(function (client) { return client.id == client_id });
    client = client[0];
    console.log(client.label)
    console.log(client.id)
    return client.label;
  }
}
