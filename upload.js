import { bytesToSize } from './core'

const element = (tag, classes = [], content) => {
  const node = document.createElement(tag)
  if (classes.length) node.classList.add(...classes)
  if (content) node.textContent = content
  return node
}

function noop() {}

export function upload(selector, options = {}) {
  let files = []
  const onUpload = options.onUpload ?? noop
  const input = document.querySelector(selector)
  const preview = element('div', ['preview'])

  const openBtn = element('button', ['btn'], 'Открыть')
  const uploadBtn = element('button', ['btn', 'primary'], 'Загрузить')
  uploadBtn.style.display = 'none'

  if (options.multi) {
    input.setAttribute('multiple', true)
  }

  if (options.accept && Array.isArray(options.accept)) {
    input.setAttribute('accept', options.accept.join(', '))
  }

  input.insertAdjacentElement('afterend', preview)
  input.insertAdjacentElement('afterend', uploadBtn)
  input.insertAdjacentElement('afterend', openBtn)

  const triggerInput = () => input.click()

  const changeHandler = event => {
    if (!event.target.files.length) return

    files = Array.from(event.target.files)
    preview.innerHTML = ''
    uploadBtn.style.display = 'inline'
    files.forEach(file => {
      if (!file.type.match('image')) return

      const reader = new FileReader()

      reader.onload = ev => {
        const src = ev.target.result
        preview.insertAdjacentHTML(
          'afterbegin',
          `
          <div class="preview-image">
          <div class="preview-remove" data-name="${file.name}">&times;</div>
            <img src="${src}" alt="${file.name}"/>
            <div class="preview-info">
                <span>${file.name}</span>
                ${bytesToSize(file.size)}
            </div>
          </div>
        `
        )
      }

      reader.readAsDataURL(file)
    })
  }

  const removeHandler = event => {
    if (!event.target.dataset.name) return

    const { name } = event.target.dataset
    files = files.filter(file => file.name !== name)

    if (!files.length) {
      uploadBtn.style.display = 'none'
    }

    const block = preview.querySelector(`[data-name="${name}"]`).closest('.preview-image')
    block.classList.add('removing')
    setTimeout(() => block.remove(), 300)
  }

  const clearPreview = el => {
    el.style.bottom = '0'
    el.innerHTML = `<div class="preview-info-progress"></div>`
  }

  const uploadHandler = () => {
    preview.querySelectorAll('.preview-remove').forEach(e => e.remove())
    const previewInfo = preview.querySelectorAll('.preview-info')
    previewInfo.forEach(clearPreview)
    onUpload(files, previewInfo)
  }

  openBtn.addEventListener('click', triggerInput)
  input.addEventListener('change', changeHandler)
  preview.addEventListener('click', removeHandler)
  uploadBtn.addEventListener('click', uploadHandler)
}
