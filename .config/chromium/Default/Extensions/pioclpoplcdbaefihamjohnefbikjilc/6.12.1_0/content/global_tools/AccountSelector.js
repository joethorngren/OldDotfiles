/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */

"use strict";function AccountRecordField(a,b,c,d,e,f,g,h,i,j){var k=this;i&&j&&(this.name=i,this.value=j),this.container=document.createElement("div"),this.container.addEventListener("click",function(b){b.stopPropagation(),b.preventDefault(),"function"==typeof e&&e(a,d,k)}),this.userId=a,this.id=this.userId||i,this.subType=d,this.header=b,this.description=c,this.container.classList.add("asField"),h&&this.container.classList.add(h),f&&this.container.classList.add("asPrimary"),this._userIcon=document.createElement("div"),this._userIcon.classList.add("asUserIcon"),this._headerElt=document.createElement("div"),this._headerElt.classList.add("asHeader"),this._descriptionElt=document.createElement("div"),this._descriptionElt.classList.add("asDescription"),this._labels=document.createElement("div"),this._labels.classList.add("asLabels"),this._labels.appendChild(this._headerElt),this._labels.appendChild(this._descriptionElt),this._dropdownIcon=document.createElement("div"),this._dropdownIcon.classList.add("asDropdownIcon"),this.container.appendChild(this._userIcon),this.container.appendChild(this._labels),this.container.appendChild(this._dropdownIcon),this.setHeader(g?b:Browser.i18n.getMessage("Sign_in")+" "+b),this.setDescription(c),this.displayDropdownIcon(!1)}function AccountSelector(a){this._globalContainer=a.globalContainer,this._accounts={},this._selectedAccountId=null,this._selectedSubpart=GlobalUtils.ACCOUNT_TYPE_PERSONAL,this._changeCallback=a.changeCallback,this._signInCallback=a.signInCallback,this._fieldContainer=a.fieldContainer,this._selectedField=null,this._dropdownID=a.dropdownID||null,this._fieldContainer.addEventListener("click",this.displayPopup.bind(this))}function AccountSelectorDropdown(a,b,c,d,e){if(!b)throw"Missing accounts list - are you logged in?";var f=this;this.isOpen=!1,this.isHidden=!1,this._globalContainer=a,c=c||{},this._selectedElementIndex=0,this._clickFn=d,this._fields=[],this._dropdownOverlay=document.createElement("div"),this._dropdownOverlay.classList.add("asDropdownOverlay"),this._dropdownOverlay.classList.add("hidden"),this._dropdownOverlay.addEventListener("click",function(a){a.preventDefault(),f.display(!1),f._clickFn()});var g=function(a,b){f._clickFn(a,b),f.display(!1)};Object.keys(b).forEach(function(a){var c=b[a];switch(c.accountType){case GlobalUtils.ACCOUNT_TYPE_BUSINESS:f._fields.push(AccountRecordField.createPersonalAccountField(c,g)),f._fields.push(AccountRecordField.createBusinessAccountField(c,g,!1));break;case GlobalUtils.ACCOUNT_TYPE_ONLY_BUSINESS:f._fields.push(AccountRecordField.createBusinessAccountField(c,g,!0));break;default:f._fields.push(AccountRecordField.createPersonalAccountField(c,g))}}),this._dropdown=document.createElement("div"),this._dropdown.classList.add("asDropdown"),this._dropdown.classList.add("hidden"),this._dropdown.setAttribute("id",e),this._fields.forEach(function(a){f._dropdown.appendChild(a.container)}),this._keyDownHandler=function(a){f.handleKey(a)},this._globalContainer.appendChild(this._dropdownOverlay),this._globalContainer.appendChild(this._dropdown),this.selectElement(c.userId,c.subType)}AccountRecordField.prototype.display=function(a){this.container.classList.toggle("hidden",!a)},AccountRecordField.prototype.displayDescription=function(a){this._descriptionElt.classList.toggle("hidden",!a)},AccountRecordField.prototype.displayDropdownIcon=function(a){this._dropdownIcon.classList.toggle("hidden",!a)},AccountRecordField.prototype.updateIcon=function(a){this._userIcon.style.backgroundImage=a?"url("+a+")":""},AccountRecordField.prototype.setHeader=function(a){this._headerElt.innerText=a||"???"},AccountRecordField.prototype.setDescription=function(a){null!==a&&void 0!==a?(this._descriptionElt.innerText=a,this.displayDescription(!0)):(this._descriptionElt.innerText="",this.displayDescription(!1))},AccountRecordField.prototype.select=function(a){this.container.classList.toggle("asSelected",a)},AccountRecordField.createPersonalAccountField=function(a,b){var c=new AccountRecordField(a.userId,a.fullName,null,GlobalUtils.ACCOUNT_TYPE_PERSONAL,b,!0,a.isAuthenticated);return platform.channel.sendMessage("downloadImage",{url:a.photoUrl,size:48}).then(function(a){c.updateIcon(a)}).catch(function(){c.updateIcon()}),c},AccountRecordField.createBusinessAccountField=function(a,b,c){var d=a.businessName||Browser.i18n.getMessage("Business"),e=new AccountRecordField(a.userId,a.fullName,d,GlobalUtils.ACCOUNT_TYPE_BUSINESS,b,c,!!a.bizAuthenticationToken);return c&&a.photoUrl?platform.channel.sendMessage("downloadImage",{url:a.photoUrl,size:48}).then(function(a){e.updateIcon(a)}).catch(function(){e.updateIcon()}):e.updateIcon(Browser.getExtensionURL("images/account-selector-avatar-business-disabled.svg")),e},AccountSelector.prototype.setSelectedField=function(a){this._selectedField&&this._fieldContainer.removeChild(this._selectedField.headerElement),this._selectedField=a;var b=this._selectedField.container.cloneNode(!0);b.querySelector(".asDropdownIcon").classList.toggle("hidden",this._accountDropdownSelector.isHidden),this._selectedField.headerElement=b,this._fieldContainer.appendChild(b),this._selectedField.setHeader(this._selectedField.header),this._accountDropdownSelector.selectElement(a.id,a.subType)},AccountSelector.prototype.createPopup=function(){var a=this;this._accountDropdownSelector||(this._accountDropdownSelector=new AccountSelectorDropdown(this._globalContainer,this._accounts,{userId:this._selectedAccountId,subType:this._selectedSubpart},function(b,c,d){a.dismissedPopup(b,c),d&&a.setSelectedField(d)},this._dropdownID))},AccountSelector.prototype.closePopup=function(){this._accountDropdownSelector.display(!1)},AccountSelector.prototype.getSelectedAccount=function(){return{userInfo:this._accounts[this._selectedAccountId],selectedSubpart:this._selectedSubpart}},AccountSelector.prototype.hideDropdown=function(){this._accountDropdownSelector.hide(),this._fieldContainer.classList.add("disabled")},AccountSelector.prototype.setData=function(a,b,c){this._accounts=a,this.createPopup()},AccountSelector.prototype.selectItem=function(a){a=a||{},a.field?this.setSelectedField(a.field):(a.selectedAccountId&&this._accounts[a.selectedAccountId]||(log.warn("Account "+a.selectedAccountId+" not found in account list, selecting first account"),a.selectedAccountId=Object.keys(this._accounts)[0]),this.setSelectedAccount(a.selectedAccountId,a.selectedSubpart))},AccountSelector.prototype.addOption=function(a){return this._accountDropdownSelector.addOption(a.header,a.description||null,a.callback||null,a.className||null,a.id||null,a.value||null)},AccountSelector.prototype.setSelectedAccount=function(a,b){if(!this._accounts[a])return void log.warn("Unable to select account "+a);b=b||(this._accounts[a].isOnlyBusiness?GlobalUtils.ACCOUNT_TYPE_BUSINESS:GlobalUtils.ACCOUNT_TYPE_PERSONAL),this._accounts[a].accountType===GlobalUtils.ACCOUNT_TYPE_ONLY_BUSINESS&&b===GlobalUtils.ACCOUNT_TYPE_PERSONAL&&(log.warn("Incorrect subpart selected for BoB account"),b=GlobalUtils.ACCOUNT_TYPE_BUSINESS),this._accounts[a].type===GlobalUtils.ACCOUNT_TYPE_PERSONAL&&b===GlobalUtils.ACCOUNT_TYPE_BUSINESS&&(log.warn("Incorrect subpart selected for non-business account"),b=GlobalUtils.ACCOUNT_TYPE_PERSONAL);this._selectedAccountId=a,this._selectedSubpart=b;var c=this._accountDropdownSelector.getField(a,b);this.setSelectedField(c),this._changeCallback(a,b),this.accountRequiresAuth(a,b)&&"function"==typeof this._signInCallback&&this._signInCallback(a,b,this._accounts[a].isAuthenticated)},AccountSelector.prototype.selectFirstLoggedIn=function(){var a=this,b=Object.keys(this._accounts).find(function(b){var c=a._accounts[b];return!c.isOnlyBusiness&&c.isAuthenticated||c.isOnlyBusiness&&c.isAuthenticatedBiz});this.setSelectedAccount(b)},AccountSelector.prototype.toggleSelectedAccount=function(){var a=Object.keys(this._accounts),b=a.indexOf(this._selectedAccountId);this.getSelectedAccount().userInfo.accountType===GlobalUtils.ACCOUNT_TYPE_BUSINESS&&this.getSelectedAccount().selectedSubpart===GlobalUtils.ACCOUNT_TYPE_PERSONAL?this.setSelectedAccount(this._selectedAccountId,GlobalUtils.ACCOUNT_TYPE_BUSINESS):(++b===a.length&&(b=0),this.setSelectedAccount(a[b]))},AccountSelector.prototype.updateAccountTier=function(a,b){this._accounts[a]?this._accounts[a]=b:log.warn("Account "+a+" not found in account list, unable to update tier!")},AccountSelector.prototype.displayPopup=function(){this.createPopup(),this._accountDropdownSelector&&this._accountDropdownSelector.isOpen&&this.closePopup();var a=this._globalContainer.getBoundingClientRect(),b=this._selectedField.headerElement.getBoundingClientRect();this._accountDropdownSelector.display(!0,b.bottom-a.top)},AccountSelector.prototype.dismissedPopup=function(a,b){a&&(b||(b=this._accounts[a].accountType===GlobalUtils.ACCOUNT_TYPE_ONLY_BUSINESS?GlobalUtils.ACCOUNT_TYPE_BUSINESS:GlobalUtils.ACCOUNT_TYPE_PERSONAL),Browser.sendToExtension({name:"trackEvent",category:"Account",action:"switch",label:b}),this.setSelectedAccount(a,b))},AccountSelector.prototype.accountRequiresAuth=function(a,b){var c=this._accounts[a];return!c.isAuthenticated||b===GlobalUtils.ACCOUNT_TYPE_BUSINESS&&!c.isAuthenticatedBiz},AccountSelectorDropdown.prototype.addOption=function(a,b,c,d,e,f){var g=new AccountRecordField(null,a,b,null,c,!0,!0,d||null,e,f);return this._fields.push(g),this._dropdown.appendChild(g.container),g},AccountSelectorDropdown.prototype.selectElement=function(a,b){for(var c=0;c<this._fields.length;c++)if(!b&&this._fields[c].name===a||this._fields[c].userId===a&&b&&this._fields[c].subType===b){this._selectedElementIndex=c;break}this.updateFields()},AccountSelectorDropdown.prototype.getField=function(a,b){for(var c=0;c<this._fields.length;c++)if(this._fields[c].userId===a&&b&&this._fields[c].subType===b)return this._fields[c]},AccountSelectorDropdown.prototype.hide=function(){this.isHidden=!0},AccountSelectorDropdown.prototype.moveSelection=function(a){this._selectedElementIndex=this._selectedElementIndex+a,this._selectedElementIndex<0&&(this._selectedElementIndex=this._fields.length-1),this._selectedElementIndex>=this._fields.length&&(this._selectedElementIndex=0),this.updateFields()},AccountSelectorDropdown.prototype.handleKey=function(a){if(this.isOpen)switch(a.keyCode){case 38:this.moveSelection(-1),a.stopPropagation(),a.preventDefault();break;case 40:this.moveSelection(1),a.stopPropagation(),a.preventDefault();break;case 27:this.display(!1),this._clickFn(),a.stopPropagation();break;case 13:this.display(!1),this._clickFn(this._fields[this._selectedElementIndex].userId,this._fields[this._selectedElementIndex].subType,this._fields[this._selectedElementIndex]),a.stopPropagation()}},AccountSelectorDropdown.prototype.updateFields=function(){for(var a=0;a<this._fields.length;a++)this._fields[a].select(this._selectedElementIndex===a)},AccountSelectorDropdown.prototype.display=function(a,b){this.isHidden||(this.isOpen=a,a?(this.updateFields(),this._dropdown.style.top=b+"px",Browser.pushKeyHandler(this._keyDownHandler)):Browser.popKeyHandler(this._keyDownHandler),this._dropdown.classList.toggle("hidden",!a),this._dropdownOverlay.classList.toggle("hidden",!a))};