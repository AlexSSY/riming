class Credential < ApplicationRecord
  belongs_to :user

  normalizes :private_key, with: ->(private_key) { private_key.strip }
  normalizes :public_key, with: ->(private_key) { private_key.strip }
  normalizes :address, with: ->(private_key) { private_key.strip }

  def to_s
    user&.email || "credential with no user"
  end
end
