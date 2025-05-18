(function () {

  'use strict';

  class BootstrapIconSelector {

    constructor(element, options) {

      this.element = element;
      this.options = Object.assign({}, BootstrapIconSelector.DEFAULTS, options);

      this.icons = [];
      this.iconSet = [];
      this.currentPage = 0;
      this.maxPages = 1;

      // Replace dropdown toggle icons if initial icon is set
      if (this.options.initialIcon) {
        this.element.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(el => {
          el.replaceChildren(this.createIcon(this.options.initialIcon));
        });
      }

      this.onClickOnIcon = this.onClickOnIcon.bind(this);
      this.onClickNextPageButton = this.onClickNextPageButton.bind(this);
      this.onClickPreviousPageButton = this.onClickPreviousPageButton.bind(this);
      this.onType = this.onType.bind(this);

      this.$icons = this.createDiv("icons");
      this.$currentPage = this.createSpan(this.currentPage + 1);
      this.$maxPages = this.createSpan(this.maxPages);
      this.$nextPageButton = this.createNextPageButton();
      this.$previousPageButton = this.createPreviousPageButton();
      this.$searchIcon = this.createSearchIcon();

      this.$nextPageButton.addEventListener("click", this.onClickNextPageButton);
      this.$previousPageButton.addEventListener("click", this.onClickPreviousPageButton);
      this.$searchIcon.addEventListener("keyup", this.onType);

      this.element.querySelectorAll('.dropdown-menu').forEach(e => {

        const container = this.createDiv("container-fluid");

        container.appendChild(this.$searchIcon);
        container.appendChild(this.$icons);
        container.appendChild(this.createPagination());

        e.appendChild(container)
      })

      if (this.options.iconSet === "bootstrapIcons") {
        this.iconSet = bootstrapIcons;
      } else if (this.options.iconSet === "flagIcons") {
        this.iconSet = flagIcons;
      } else {
        this.icons = [];
      }

      this.search("");
    }

    static get DEFAULTS() {
      return {
        initialIcon: null,
        iconSet: "bootstrapIcons",
        maxColumns: 4,
        maxRows: 3,
        onSelect: () => { }
      };
    }

    onClickNextPageButton(event) {

      event.stopPropagation();

      if (this.currentPage + 1 < this.maxPages) {
        this.currentPage++;
      }

      this.update(this.icons);
    }

    onClickPreviousPageButton(event) {

      event.stopPropagation();

      if (this.currentPage > 0) {
        this.currentPage--;
      }

      this.update(this.icons);
    }

    onType(event) {

      this.search(this.$searchIcon.value);
    }

    onClickOnIcon(e) {

      const { target } = e;

      let classNames = "";

      if (target.tagName === "BUTTON") {
        classNames = target.querySelectorAll("i")[0].className;
      }

      if (target.tagName === "I") {
        classNames = target.className;
      }

      this.element.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(el => {
        el.replaceChildren(this.createIcon(classNames));
      });

      const dropdownToggle = this.element.querySelector('.dropdown-toggle');

      bootstrap.Dropdown.getInstance(dropdownToggle).hide();

      if (this.options.onSelect && typeof this.options.onSelect === 'function') {
        this.options.onSelect(classNames);
      }
    }

    updatePagination() {

      this.$currentPage.innerHTML = this.currentPage + 1;
      this.$maxPages.innerHTML = this.maxPages;
    }

    isBlank(str) {
      return !str || str.trim() === ""
    }

    search(searchTerm = "") {

      if (this.isBlank(searchTerm)) {
        this.icons = this.iconSet
      } else {
        this.icons = this.iconSet.filter(e => e.includes(searchTerm));
      }

      this.currentPage = 0;

      this.update(this.icons);
    }

    update(icons = []) {

      if (icons.length === 0) {
        this.$icons.replaceChildren(this.createNotFound());
        this.updatePagination();
        return;
      }

      const itemsPerPage = this.options.maxColumns * this.options.maxRows;

      this.maxPages = Math.ceil(icons.length / itemsPerPage);

      const paginated = icons.slice(this.currentPage * itemsPerPage, (this.currentPage + 1) * itemsPerPage);

      this.$icons.innerHTML = "";

      let div = this.createElement("div", "d-flex flex-row gap-3 mb-2");

      for (const [i, item] of paginated.entries()) {

        const btn = this.createButtonWithIcon(item);

        btn.addEventListener("click", this.onClickOnIcon);

        div.appendChild(btn);

        const isLastInRow = div.children.length === this.options.maxColumns;
        const isLastItem = i === paginated.length - 1;

        if (isLastInRow || isLastItem) {

          this.$icons.appendChild(div);

          if (!isLastInRow) {
            break;
          }

          div = this.createElement("div", "d-flex flex-row gap-3 mb-2");
        }
      }

      this.updatePagination()
    }

    createDiv(classNames = "") {

      const el = document.createElement('div');

      if (classNames !== "") {
        el.setAttribute("class", classNames);
      }

      return el;
    }

    createButtonWithIcon(iconAsClassNames) {

      const btnEl = this.createElement('button', "btn btn-outline-secondary");

      btnEl.setAttribute("title", iconAsClassNames);

      const iconEl = this.createElement('i', iconAsClassNames);

      btnEl.appendChild(iconEl);

      return btnEl;
    }

    createNotFound() {

      const span = this.createElement('p', "small text-secondary pt-1", "", "Not Found");

      const div = this.createElement('div', "col");

      div.appendChild(span);

      this.maxPages = 1;

      return div;
    }

    createSearchIcon() {

      const el = this.createElement('input', "form-control form-control-sm mb-2", "search-icon");

      el.setAttribute("type", "text");
      el.setAttribute("placeholder", "Search icons");

      return el;
    }

    createPagination() {

      const div = this.createElement('div', "pagination d-flex justify-content-between align-items-center");

      div.appendChild(this.$previousPageButton);
      div.appendChild(this.createCurrentPageText())
      div.appendChild(this.$nextPageButton)

      return div;
    }

    createCurrentPageText() {

      const el = this.createElement('small', "text-secondary");

      el.appendChild(this.$currentPage);
      el.appendChild(this.createSpan("&#47"));
      el.appendChild(this.$maxPages);

      return el;
    }

    createElement(tag, classNames = "", id = "", content = "") {

      const el = document.createElement(tag);

      if (classNames !== "") {
        el.setAttribute("class", classNames);
      }

      if (id !== "") {
        el.setAttribute("id", id);
      }

      if (content !== "") {
        el.innerHTML = content;
      }

      return el;
    }

    createSpan(content, classNames = "", id = "", onChangeCallback = () => { }) {

      const el = this.createElement('span', classNames, id);

      el.innerHTML = content;

      return el;
    }

    createPaginationButton(icon, callback) {

      const el = this.createElement('button', "btn btn-sm btn-secondary");

      el.appendChild(this.createIcon(icon));
      el.addEventListener("click", callback);

      return el;
    }

    createPreviousPageButton() {

      const el = this.createElement('button', "btn btn-sm btn-secondary");

      el.appendChild(this.createIcon("bi bi-arrow-left"));

      return el;
    }

    createNextPageButton(onClick) {

      const el = this.createElement('button', "btn btn-sm btn-secondary");

      el.appendChild(this.createIcon("bi bi-arrow-right"));

      return el;
    }

    createIcon(classNames = "") {

      return this.createElement('i', classNames);
    }
  }

  // Plugin definition
  window.BootstrapIconSelector = function (element, options) {
    new BootstrapIconSelector(element, options);
  };

})();