export const enableValidation = (config) => {
    const formList = Array.from(document.querySelectorAll(config.formSelector))
    formList.forEach((formElement) => {
        setEventListeners(formElement, config)
    })
}

export const clearValidation = (formElement, config) => {
    const buttonElement = formElement.querySelector(config.submitButtonSelector)
    const inputList = Array.from(formElement.querySelectorAll(config.inputSelector))

    disableSubmitButton(buttonElement, config)
    inputList.forEach((inputElement) => {
        hideInputError(formElement, inputElement, config)
    })    
}

const setEventListeners = (formElement, config) => {
    const inputList = Array.from(formElement.querySelectorAll(config.inputSelector))
    const buttonElement = formElement.querySelector(config.submitButtonSelector)

    toggleButtonState(inputList, buttonElement, config)

    inputList.forEach((inputElement) => {
        inputElement.addEventListener("input", () => {
            checkInputValidity(formElement, inputElement, config)
            toggleButtonState(inputList, buttonElement, config)
        })
    })
}

const toggleButtonState = (inputList, buttonElement, config) => {
    if (hasInvalidInput(inputList))
        disableSubmitButton(buttonElement, config)
    else enableSubmitButton(buttonElement, config)
}

const hasInvalidInput = (inputList) => {
    return inputList.some((inputElement) => {
        return !inputElement.validity.valid
    })
}

export const disableSubmitButton = (buttonElement, config) => {
    buttonElement.disabled = true
    buttonElement.classList.add(config.inactiveButtonClass)
}

export const enableSubmitButton = (buttonElement, config) => {
    buttonElement.disabled = false
    buttonElement.classList.remove(config.inactiveButtonClass)
}

const checkInputValidity = (formElement, inputElement, config) => {
    if (inputElement.validity.patternMismatch && inputElement.dataset.errorMessage)
        inputElement.setCustomValidity(inputElement.dataset.errorMessage)
    else inputElement.setCustomValidity("")

    if (!inputElement.validity.valid)
        showInputError(formElement, inputElement, config)
    else
        hideInputError(formElement, inputElement, config)
}

const showInputError = (formElement, inputElement, config) => {
    inputElement.classList.add(config.inputErrorClass)

    const errorElement = formElement.querySelector(`#${inputElement.id}-error`)
    errorElement.textContent = inputElement.validationMessage
    errorElement.classList.add(config.errorClass)

}

const hideInputError = (formElement, inputElement, config) => {
    inputElement.classList.remove(config.inputErrorClass)

    const errorElement = formElement.querySelector(`#${inputElement.id}-error`)
    errorElement.textContent = ""
    errorElement.classList.remove(config.errorClass)
}
