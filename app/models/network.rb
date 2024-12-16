class Network < ApplicationRecord
  normalizes :name, with: ->(name) { name.strip.downcase }
  normalizes :symbol, with: ->(symbol) { symbol.strip.upcase }

  validates_presence_of :name, :symbol
  validates_uniqueness_of :name

  def to_s
    name
  end
end
