class VsDropdown extends HTMLElement {
    constructor() {
      super();
      this._options = null;
      this._label = null;
      this._multiselect = false;
      this._filtered_options = null;
      this._search_query = "";
      this._is_open = false;
      this._cur_pos = 0;
      this._final_options = [];
      
    }

    static get observedAttributes() {
      return ["v-options", "v-label", "searchable", "multiselect"];
    }

    attributeChangedCallback(name, oldValue, newValue) {

      switch (name) {

        case "v-options":

          if(newValue && newValue.length > 0){
            this._options = JSON.parse(newValue.toString());
          }
          else{
            this._options = [];
          }

          var options = this._options;

          options = options.map(function(e_option, e_key){
            if(typeof e_option == "string"){
              return {
                title: e_option,
              };
            }
            else{
              return {
                title: e_option.title,
                selected: e_option.hasOwnProperty('selected') ? true: false
              };
            }
          });

          this._options = options;

          this._filtered_options = this._options;
          
          break;
        case "v-label":
          this._label = newValue;
          break;
        case "searchable":
          if (
            newValue == "true" ||
            newValue == undefined ||
            newValue == ""
          ) {
            this._searchable = true;
          } else {
            this._searchable = false;
          }

          break;
        case "multiselect":
          if (
            newValue == "true" ||
            newValue == undefined ||
            newValue == ""
          ) {
            this._multiselect = true;
          } else {
            this._multiselect = false;
          }
          break;
      }

    }

    clearOptions(){
      var that = this;

      var options = that._options;

      options = options.map(function(e_option, e_key){
        e_option.selected = false;
        return e_option;
      });

      this._filtered_options = options;

      this._updateRendering();
    }

    handleSubmit(){
      var that = this;

      var options = that._options;

      var titles = options.reduce(function(old, e_option, e_key){
        if(e_option.selected == true){
          old.push(e_option.title);
        }

        return old;
      }, []);

      this._final_options = (titles && titles.length > 0) ? titles : [];
      this._filtered_options = options;
      this._is_open = false;
      
      this._updateRendering();
    }

    startSearch(e, that){
        
        that._cur_pos = e.target.selectionStart;

        var options = that._options;
        
        var search_query = that.querySelector('.v-search').value.toString().toLowerCase();
        
        this._search_query = search_query;

        var options_filtered = options.reduce(function(templ, e_option, e_key){

            var title = e_option.title;
            
            var title = title.toString().toLowerCase();
            
            if(title.includes(search_query)){
                templ.push(e_option);
            }

            return templ;
        }, []);

        this._filtered_options = options_filtered;

        this._updateRendering();
    }

    handleCheckBox(e, $checkbox){
      
      var value = $checkbox.querySelector("input[type='checkbox']").value;
      var selected = false;
      var options = this._options;
      var is_select_all = $checkbox.classList.contains('select-all') ? true : false;
      var select_all = null;

      selected = $checkbox.classList.contains('active') ? false : true;

      //is select all checkbox clicked
      if(is_select_all){
        
        //if true, then invert to false
        selected = $checkbox.querySelector('input[type="checkbox"]:checked') ? false : true;
        // selected = $checkbox.querySelector('input[type="checkbox"]').contains('active') ? false : true;
        
        //if unchecked
        if(selected){
          select_all = true;
          $checkbox.classList.add('active');
        }
        else{//if
          select_all = false;
          $checkbox.classList.remove('active');
        }
      }

      var multiselect = this._multiselect;

      options = options.map(function(e_option, e_key){

        if(multiselect == false){
          if(e_option.title == value && selected){
            e_option.selected = true;
          }
          else{
            e_option.selected = false;
          }
        }
        else{
          if(select_all != null){
            e_option.selected = select_all;
          }
          else if(e_option.title == value){
            e_option.selected = selected;
          }
        }

        return e_option;
      });

      this._filtered_options = options;
      this._updateRendering();
    }

    showDropdDown() {
        const that = this;
        /*that.querySelector(".v-btn").classList.add('hidden');
        that.querySelector(".v-list-container").classList.remove('hidden');*/
        that.querySelector(".v-search").focus();
        that._is_open = true;
        this._updateRendering();
    }

    connectedCallback() {
      this._updateRendering();
    }

    get options() {
      return this._options;
    }
    set options(v) {
      this.setAttribute("v-options", v);
    }

    get label() {
      return this._label;
    }
    set label(v) {
      this.setAttribute("v-label", v);
    }

    get searchable() {
      return this._searchable;
    }
    set searchable(v) {
      this.setAttribute("searchable", v);
    }

    get multiselect() {
      return this._multiselect;
    }
    set multiselect(v) {
      this.setAttribute("multiselect", v);
    }

    _updateCheckBox(options, all_option = false, par_option = false, selectall = ""){

        var option_selected = false;
        var all_selected = 0;
        
        var options_template = options.reduce(function(templ, e_option, e_key){
        
            var title = e_option.title ? e_option.title : "";
            var value = title;
            var selected = (e_option.hasOwnProperty("selected") && e_option.selected) ? "checked": "";
            var active = (selected) ? "active": "";
            
            if(selected){
                option_selected = true;
                all_selected++;
            }

            if(all_option == true || par_option == true){
                selected = "checked";
            }

            var type = all_option ? 'all' : (par_option ? 'partial' : '');

            return templ + `<li>
                <label class="v-checkbox ${selectall} ${active}">${title}
                <input type="checkbox" ${selected} value="${value}"/>
                <span class="v-checkmark ${type}"></span>
                </label>
            </li>`;
        }, "");

        var resp = {
            template: options_template,
            partial_selected: option_selected,
            all_selected: (all_selected == options.length)
        }

        return resp;
    }

    _updateRendering() {
      var that = this;
      var options = this._filtered_options;
      var label = this._label;
      var final_options = this._final_options;
      var option_selected = false;
      var hs_searchable = this._searchable ? '' : 'hidden';
      var hs_multiselect = this._multiselect ? '' : 'hidden';
      var hs_list = this._is_open ? '' : 'hidden';
      var hs_btn = !this._is_open ? '' : 'hidden';
      var cur_pos = this._cur_pos;
      var search_query = this._search_query;
      
      var options_template = this._updateCheckBox(options);
      
      var par_options_template = this._updateCheckBox([""], options_template.all_selected, options_template.partial_selected, "select-all");

      var final_label = (label && final_options.length > 0) ? (label + " - <b>" + final_options.join(", ")+"</b>") : label;
      
      var template = `
        <div class="v-dropdown">
            <div class="v-btn ${hs_btn}" title="${final_options.join(", ")}">
                <span>${final_label}</span> <img class="vs vs-down" src="up_down.png" />
            </div>
            <div class="v-list-container ${hs_list}">
                <input type="text" class="v-search ${hs_searchable}" value="${search_query}" placeholder="Search" />
                <div class="v-list">
                    <ul class="v-f-list ${hs_multiselect}">${par_options_template.template}</ul>
                    <ul class="v-list-data">${options_template.template}</ul>
                    <div class="v-control">
                        <div class="v-handle">
                            <span class="v-clear">Clear</span>
                            <span class="v-submit">Submit</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            `;

      if (options) {
        this.innerHTML = template;
      } else {

      }

        console.log(that);
        this.querySelector(".v-btn").addEventListener("click", function(e){ that.showDropdDown()});
        this.querySelector(".v-search").addEventListener("input", function(e){that.startSearch(e, that)});
        this.querySelector(".v-search").focus();
        this.querySelector(".v-search").setSelectionRange(cur_pos, cur_pos);
        this.querySelector('.v-clear').addEventListener("click", function(e){that.clearOptions()});
        this.querySelector('.v-submit').addEventListener("click", function(e){that.handleSubmit()});
        var _checkbox = this.querySelectorAll('.v-checkbox');

        for (var i = 0; i < _checkbox.length; i++) {
          _checkbox[i].addEventListener('click', function(event) {
            event.preventDefault();
            that.handleCheckBox(event, this);
          });
        }
    }
  }

  customElements.define("vs-dropdown", VsDropdown);