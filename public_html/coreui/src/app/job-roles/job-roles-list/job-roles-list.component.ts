import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {FormGroup, FormBuilder } from '@angular/forms';
import { JobRolesFormComponent} from '../job-roles-form/job-roles-form.component';
import { ApiService } from '../../services/api.service'
import { JobRole } from '../job-role-model';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import * as $ from 'jquery';
import { CommonService } from '../../services/common.service';
declare function setDataTable(options:any,table: string): void;
declare function fixedHeaderTable(ele:any): void;
declare function refreshSelectpicker(): void;


@Component({
  selector: 'app-job-roles-list',
  templateUrl: './job-roles-list.component.html',
  styleUrls: ['./job-roles-list.component.css']
})
export class JobRolesListComponent implements OnInit {
  job_role_data: JobRole[] = [];
  headers: string[];
  JobRoles : {};
  row_count   : 0;
  row_per_page : number;
  page : number;
  formData : {};
  totalPages :number;
  id:number;
  totalPagesArr : [];
  item_before_modified : any;
  form: FormGroup;  
  @ViewChild('app_job_role_form', {static: false}) app_job_role_form:JobRolesFormComponent;
  @ViewChild('getModal') getModal: ElementRef<HTMLElement>;  
  @ViewChild('getModalDelete') getModalDelete: ElementRef<HTMLElement>;  

  log: any;
  advanced_filter_search : boolean = false;
  params: {};
  list_items_data : [];
  constructor(public API: ApiService,builder: FormBuilder,private confirmationDialogService: ConfirmationDialogService, private commonService : CommonService) {
	  this.JobRoles = new JobRole();
      this.form = builder.group(this.JobRoles);
	  commonService.module_advanced_search$.subscribe(data => {
        this.advanced_filter_search = data;
      })

      commonService.module_form$.subscribe(data => {
        try{
        document.getElementById('module_form').click();
          setTimeout(function(){
			this.vaccancy = [];
            refreshSelectpicker()  
          },500)
        }catch(e){}        
      });
  }

  ngOnInit() {
    var data = [];
	this.advanced_filter_search = false;
    this.getJobRole({data:[],action:'search'},1,10);
    this.getListItems();
  }

  saveForm(formData: JobRole) {
    this.API.post('job-role.php',{data:formData})
    .subscribe(data => {
      if(data.status == "success") {
        this.getJobRole({data:[]},this.page,this.row_per_page);  
      }else{

      }
    }); 
  }

  getJobRole(data:any,page_no=0,row_per_page=0) {
    data.page = page_no;
    data.row_per_page = row_per_page;
    data.totalPagesArr = [];
    this.API.post('job-role.php',data)
    .subscribe(data => {
      this.job_role_data = data.data;
      this.row_count = data.totalCnt;
      this.page = page_no;
      this.row_per_page  = row_per_page;
      this.totalPagesArr = data.totalPagesArr; 
    });
    setTimeout( function(){
      fixedHeaderTable($('.listing-table-wrapper'));
    },1000);
  }

  getCurrentPage(rows: 0,from=''){
    this.page = from == "rpp" ? 1 : rows;
    this.row_per_page = from == "rpp" ?  rows : this.row_per_page;
    this.getJobRole({data:[],action:'search'},this.page,this.row_per_page);
   }
 
 
  editJobRole(data:any) {
	this.item_before_modified = JSON.stringify(this.job_role_data);
	setTimeout(refreshSelectpicker, 500);
    this.app_job_role_form.editForm(data);
  }
 
  deleteJobRole(id:any){
    this.id = id;
    let el: HTMLElement = this.getModalDelete.nativeElement;
    el.click();
  }

  /*confirmDelete(){
    this.params = {'jobs_id':this.id,'action':'delete'};
    this.deleteJobRoleData(this.params);
  }*/

  deleteJobRoleData(params: any) {
    this.API.post('job-role.php',{data:params})
    .subscribe(data => {
      if(data.status == "success") {
        this.getJobRole({data:[]},this.page,this.row_per_page);  
      }
    }); 
  }

  showAdvancedSearch(){
    this.advanced_filter_search = (this.advanced_filter_search) ? false: true;
    setTimeout(function(){
      refreshSelectpicker();
    },1000)

  }

  getListItems(){
    var data = {
      'request_items': {
        'list_items': ['shift_type'],
        'modules': ['client','business_unit','jobs'],
      }
    };
    this.API.post('job-role.php',data)
    .subscribe(data => {
      this.list_items_data = data;
      setTimeout(function(){
        refreshSelectpicker();
      },1000)
    });
  }
    filterSearch(){
    this.getJobRole({data:this.JobRoles,action:'search'},1,this.row_per_page);
  }
  clearSearch(){
    this.app_job_role_form.resetForm();
    setTimeout(function(){
		refreshSelectpicker();
      },500)
  }
  clearSearchFilter(){
    this.form.reset();
    refreshSelectpicker();
  }
  
  formSubmit(){
    this.app_job_role_form.saveForm();
  }

  cancelSave(){
    this.getJobRole({data:[]},this.page,this.row_per_page);
  }

showListLabel(list_id:any,type:any,list_item:any){    
    if(typeof(list_id) == 'undefined') return '';
    var _list_item = [];
    _list_item = this.list_items_data[type][list_item];
    var list = _list_item.filter(function (items) { if(type == 'modules') {
      return items.id == list_id
     }else if(type == 'list_items') {
      return items.list_item_id == list_id
     }
     });
    var item = list[0];
    if(typeof(item) == 'undefined' && list_item == 'business_unit'){
      list = _list_item.filter(function (items) {
      return items.id == list_id
     });
    }
    if(typeof(item) != 'undefined'){
      if(type == 'modules') {
        return item.label;
       }else if(type == 'list_items') {
        return item.list_item_title;
       }      
    }else{
      return '--';
    }    
  }
   public removeItem(idx:any,item:any) {
	this.params = {'job_role_id':item,'action':'delete'};
    
    this.confirmationDialogService.confirm('Delete','Do you really want to delete ?')
    .then((confirmed) => (confirmed) ? this.deleteJobRoleData(this.params) : '')
    .catch(() => console.log(''));
  }
  }