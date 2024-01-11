Rails.application.routes.draw do
  resources :cheques, only: %i[show new]

  root 'cheques#index'
end
