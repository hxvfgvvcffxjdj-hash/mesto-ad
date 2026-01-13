/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addCard, deleteCardFromServer, changeLikeCardStatus } from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation, disableSubmitButton, enableSubmitButton } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");
const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalTitle = usersStatsModalWindow.querySelector(".popup__title");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalText = usersStatsModalWindow.querySelector(".popup__text");
const usersStatsModalUserList = usersStatsModalWindow.querySelector(".popup__list");
const logoElement = document.querySelector(".header__logo");
const profileFormButton = profileForm.querySelector(".popup__button");
const cardFormButton = cardForm.querySelector(".popup__button");
const avatarFormButton = avatarForm.querySelector(".popup__button");
const removeCardFormButton = removeCardForm.querySelector(".popup__button");
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const initialText = profileFormButton.textContent;
  profileFormButton.textContent = "Сохранение...";
  disableSubmitButton(profileFormButton, validationSettings);
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      profileFormButton.textContent = initialText;
      enableSubmitButton(profileFormButton, validationSettings);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const initialText = avatarFormButton.textContent;
  avatarFormButton.textContent = "Сохранение...";
  disableSubmitButton(avatarFormButton, validationSettings);
  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      avatarFormButton.textContent = initialText;
      enableSubmitButton(avatarFormButton, validationSettings);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const initialText = cardFormButton.textContent;
  cardFormButton.textContent = "Создание...";
  disableSubmitButton(cardFormButton, validationSettings);
  addCard({ name: cardNameInput.value, link: cardLinkInput.value })
    .then((card) => {
      placesWrap.prepend(
        createCardElement(
          card,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
          },
          userId
        )
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      cardFormButton.textContent = initialText;
      enableSubmitButton(cardFormButton, validationSettings);
    });
};

let currentCardIdToDelete = null;
let currentCardElementToDelete = null;

const handleDeleteCard = (cardId, cardElement) => {
  currentCardIdToDelete = cardId;
  currentCardElementToDelete = cardElement;
  openModalWindow(removeCardModalWindow);
};

const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();
  const initialText = removeCardFormButton.textContent;
  removeCardFormButton.textContent = "Удаление...";
  disableSubmitButton(removeCardFormButton, validationSettings);
  deleteCardFromServer(currentCardIdToDelete)
    .then((res) => {
      deleteCard(currentCardElementToDelete);
      closeModalWindow(removeCardModalWindow);
      currentCardIdToDelete = null;
      currentCardElementToDelete = null;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      removeCardFormButton.textContent = initialText;
      enableSubmitButton(removeCardFormButton, validationSettings);
    });
};

const handleLikeCard = (cardId, likeButton) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  changeLikeCardStatus(cardId, isLiked)
    .then((curCard) => {
      const cntLikeElement = likeButton.parentElement.querySelector(".card__like-count");
      if (cntLikeElement) {
        cntLikeElement.textContent = curCard.likes.length;
      }
      likeCard(likeButton);
    })
    .catch((err) => {
      console.log(err);
    });
}

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template");
  const infoItem = template.content.cloneNode(true);
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  return infoItem;
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      usersStatsModalInfoList.innerHTML = "";
      usersStatsModalUserList.innerHTML = "";

      let firstCard = null;
      let lastCard = null;
      if (cards.length > 0) {
        firstCard = cards[0];
        lastCard = cards[0];
        cards.forEach((card) => {
          const cardDate = new Date(card.createdAt);
          if (cardDate < new Date(firstCard.createdAt)) {
            firstCard = card;
          }
          if (cardDate > new Date(lastCard.createdAt)) {
            lastCard = card;
          }
        });
      }

      const usersObj = {};

      cards.forEach((card) => {
        const userId = card.owner._id;
        if (!usersObj[userId]) {
          usersObj[userId] = { name: card.owner.name, cardCount: 0 };
        }
        usersObj[userId].cardCount++;
      });

      const usersArray = Object.values(usersObj);
      let maxCards = 0;

      for (const k in usersArray) {
        if (usersArray[k].cardCount > maxCards) {
          maxCards = usersArray[k].cardCount;
        }
      }

      usersStatsModalTitle.textContent = "Статистика пользователей";
      usersStatsModalInfoList.append(createInfoString("Всего карточек:", cards.length.toString()));

      if (cards.length > 0) {
        usersStatsModalInfoList.append(createInfoString("Первая создана:", formatDate(new Date(firstCard.createdAt))));
        usersStatsModalInfoList.append(createInfoString("Последняя создана:", formatDate(new Date(lastCard.createdAt))));
      }

      usersStatsModalInfoList.append(createInfoString("Всего пользователей:", usersArray.length.toString()));
      usersStatsModalInfoList.append(createInfoString("Максимум карточек от одного:", maxCards.toString()));

      usersStatsModalText.textContent = "Все пользователи:";

      const userTemplate = document.getElementById("popup-info-user-preview-template");
      usersArray.forEach((user) => {
        const item = userTemplate.content.cloneNode(true).querySelector(".popup__list-item");
        item.textContent = user.name;
        usersStatsModalUserList.append(item);
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log(err)
    });
};

logoElement.addEventListener("click", handleLogoClick);

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

let userId = null;

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
      userId = userData._id
      cards.forEach((card) => {
        placesWrap.append(
          createCardElement(card, {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard
          }, userId)
        )
    })
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`
    profileTitle.textContent = userData.name
    profileDescription.textContent = userData.about
  })
  .catch((err) => {
    console.log(err); 
  });
