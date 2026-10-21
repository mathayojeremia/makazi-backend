-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) DEFAULT 'tenant',
    nida VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Houses table
CREATE TABLE IF NOT EXISTS houses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    area VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL,
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    parking INTEGER DEFAULT 0,
    size INTEGER DEFAULT 0,
    amenities TEXT[],
    images TEXT[],
    owner_id INTEGER REFERENCES users(id),
    verified BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    inquiries INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    house_id INTEGER REFERENCES houses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, house_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    house_id INTEGER REFERENCES houses(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    house_id INTEGER REFERENCES houses(id),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    house_id INTEGER REFERENCES houses(id),
    amount INTEGER NOT NULL,
    method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_houses_city ON houses(city);
CREATE INDEX idx_houses_area ON houses(area);
CREATE INDEX idx_houses_price ON houses(price);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);