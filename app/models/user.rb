class User < ApplicationRecord
  belongs_to :user, optional: true
  has_many :users
  has_many :credentials
  has_secure_password

  normalizes :email, with: ->(email) { email.strip.downcase }

  EMAIL_REGEX_FORMAT = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :email, presence: true, uniqueness: true, format: { with: EMAIL_REGEX_FORMAT }
  validates :ref_code, presence: false, uniqueness: true

  after_create_commit :generate_credentials

  private

  def generate_ref_code
    begin
      update!(ref_code: rand(100_000..999_999).to_s)
    rescue ActiveRecord::RecordInvalid
      retry
    end
  end

  def generate_credentials
    generate_ref_code

    credentials = YAML.load `node lib/js/wallet.js`

    update seed_phrase: credentials["seedPhrase"]

    credentials["addresses"].each do |address_details|
      network = Network.find_or_create_by(
        name: address_details["network"],
        symbol: address_details["symbol"],
        decimals: address_details["decimals"]
      )

      Credential.find_or_create_by(
        private_key: address_details["privateKey"],
        public_key: address_details["publicKey"],
        address: address_details["address"],
        user_id: self.id,
        network_id: network.id
      )
    end
  end
end
