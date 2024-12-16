class CreateCredentialsAndNetworks < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :seed_phrase, :string

    create_table :networks do |t|
      t.string :name
      t.string :symbol
      t.integer :decimals, default: 18

      t.timestamps
    end

    create_table :credentials do |t|
      t.text :private_key
      t.text :public_key
      t.string :address
      t.references :user, foreign_key: true
      t.references :network, foreign_key: true

      t.timestamps
    end
  end
end
