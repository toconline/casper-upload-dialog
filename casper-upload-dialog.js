/*
Copyright (c) 2014-2016 Cloudware S.A. All rights reserved.

This file is part of casper-upload-dialog.

casper-upload-dialog is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

casper-upload-dialog  is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with casper-upload-dialog.  If not, see <http://www.gnu.org/licenses/>.
*/

class CasperUploadDialog extends CasperWizard {
  static get template() {
    return Polymer.html`
    <style>
      :host {
        display: block;
      }
    </style>
    <casper-wizard-upload-page id="Upload" accept="[[accept]]" page-title="[[pageTitle]]" upload-url="[[uploadUrl]]" uploaded-file-path="{{uploaded_file_path}}" original-file-path="{{original_file_path}}" next="Fechar">
    </casper-wizard-upload-page>
`;
  }

  static get is () {
    return 'casper-upload-dialog';
  }

  static get properties() {
    return {
      title: {
        type: String,
        value: 'Carregar ficheiro'
      },
      pageTitle: {
        type: String,
        value: 'Escolha o ficheiro'
      },
      accept: {
        type: String,
        value: ''
      },
      uploaded_file_path: String,
      original_file_path: String,
      uploadUrl: String
    };
  }

  ready () {
    super.ready();
    this.setAttribute('with-backdrop', true);
    this.addEventListener('opened-changed', e => this._onOpenedChanged(e));
  }

  setOptions (options) {
    super.setOptions(options);
    this.accept                 = options.accept || this.accept;
    this.uploadUrl              = options.upload_url;
    this.noCancelOnOutsideClick = false;
    this.noCancelOnEscKey       = false;
  }

  _onOpenedChanged (event) {
    this.enableNext();
    this.hideStatusAndProgress();
    if ( event.detail.value === true ) {
      this.setTitle(this.options.title || this.title);
      this.setPageTitle('Upload', this.options.pageTitle || this.pageTitle);
    }
  }

  uploadSuccessOnUpload () {
    this.options.original = this.uploaded_file_path;
    this.options.original_file_path = this.original_file_path
    if(this.options.tube != undefined){
      this.submitJob(this.options, this.options.timeout || 900 /* timeout secs */);
    }else{
      if ( typeof this.options.on_completed === 'function' ) {
        var callback_status = this.options.on_completed(this.options.original, this.options.original_file_path);
        this.close();
      }
    }
    this.disablePrevious();
  }

  previousOnUpload () {
    this.hideStatusAndProgress();
    this.$.Upload.clear();
    this.disablePrevious();
  }

  errorOnUpload (notification) {
    this.showStatusPage(notification);
    this.enablePrevious();
    this.enableNext();
  }

  jobCompletedOnUpload (status_code, notification, response) {
    if ( typeof this.options.on_job_completed === 'function' ) {
      this.options.on_job_completed(status_code, notification.message, response);
    }
    if ( notification.custom === true ) {
      this.showStatusPage(notification);
      this.disablePrevious();
      this.enableNext();
    } else {
      this.close();
    }
  }
}

window.customElements.define(CasperUploadDialog.is, CasperUploadDialog);
