import { Core } from './core'

export class Upload {
  #files = []
  preview = this.createElement('div', ['preview'])
  openBtn = this.createElement('button', ['btn'], 'Открыть')
  uploadBtn = this.createElement('button', ['btn', 'primary'], 'Загрузить')

  constructor(selector, options = {}) {
    this.selector = selector
    this.input = document.querySelector(this.selector)
    this.options = options
    this.onUpload = options.onUpload ?? this.noop
    this.init()
  }

  init() {
    this.uploadBtn.style.display = 'none'
    if (this.options.multi) {
      this.input.setAttribute('multiple', true)
    }

    if (this.options.accept && Array.isArray(this.options.accept)) {
      this.input.setAttribute('accept', this.options.accept.join(', '))
    }

    this.input.insertAdjacentElement('afterend', this.preview)
    this.input.insertAdjacentElement('afterend', this.uploadBtn)
    this.input.insertAdjacentElement('afterend', this.openBtn)

    this.openBtn.addEventListener('click', this.triggerInput)
    this.input.addEventListener('change', this.changeHandler)
    this.preview.addEventListener('click', this.removeHandler)
    this.uploadBtn.addEventListener('click', this.uploadHandler)
  }

  noop() {}

  createElement(tag, classes = [], content) {
    const node = document.createElement(tag)
    if (classes.length) node.classList.add(...classes)
    if (content) node.textContent = content
    return node
  }

  triggerInput = () => this.input.click()

  changeHandler = event => {
    if (!event.target.files.length) return

    this.#files = Array.from(event.target.files)
    this.preview.innerHTML = ''
    this.uploadBtn.style.display = 'inline'
    this.#files.forEach(file => {
      if (!file.type.match('image')) return

      const reader = new FileReader()

      reader.onload = ev => {
        const src = ev.target.result
        this.preview.insertAdjacentHTML(
          'afterbegin',
          `
          <div class="preview-image">
          <div class="preview-remove" data-name="${file.name}">&times;</div>
            <img src="${src}" alt="${file.name}"/>
            <div class="preview-info">
                <span>${file.name}</span>
                ${Core.bytesToSize(file.size)}
            </div>
          </div>
        `
        )
      }

      reader.readAsDataURL(file)
    })
  }

  removeHandler = event => {
    if (!event.target.dataset.name) return

    const { name } = event.target.dataset
    this.#files = this.#files.filter(file => file.name !== name)

    if (!this.#files.length) {
      this.uploadBtn.style.display = 'none'
    }

    const block = this.preview.querySelector(`[data-name="${name}"]`).closest('.preview-image')
    block.classList.add('removing')
    setTimeout(() => block.remove(), 300)
  }

  clearPreview = el => {
    el.style.bottom = '0'
    el.innerHTML = `<div class="preview-info-progress"></div>`
  }

  uploadHandler = () => {
    this.preview.querySelectorAll('.preview-remove').forEach(e => e.remove())
    const previewInfo = this.preview.querySelectorAll('.preview-info')
    previewInfo.forEach(this.clearPreview)
    this.onUpload(this.#files, previewInfo)
  }
}
