import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '../app/profile/page';

const mockUser = {
    _id: 'user1',
    username: 'alice',
    bio: 'Film enthusiast.',
    avatar: null,
    watched: [{ _id: 'm1', title: 'Inception', year: 2010, poster: null, rating: 8.8 }],
    watchlist: [],
    favorites: [],
};

beforeEach(() => {
    localStorage.setItem('token', 'fake-token');

    global.fetch = jest.fn((url) => {
        if (url.includes('/api/users/me')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ user: mockUser }) });
        }
        if (url.includes('/api/clubs')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
});

afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
});

// 1
test('shows Loading... before user data is fetched', () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    render(<ProfilePage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
});

// 2
test('renders username and bio after loading', async () => {
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByText('alice')).toBeInTheDocument());
    expect(screen.getByText('"Film enthusiast."')).toBeInTheDocument();
});

// 3
test('redirects to /login if no token', () => {
    localStorage.clear();
    delete window.location;
    window.location = { href: '' };
    render(<ProfilePage />);
    expect(window.location.href).toBe('/login');
});

// 4
test('switching to watchlist tab shows empty state message', async () => {
    render(<ProfilePage />);
    await screen.findByText('alice');

    const buttons = screen.getAllByText(/Watchlist/);
    fireEvent.click(buttons.find(el => el.tagName === 'BUTTON'));
    expect(screen.getByText('Your watchlist is empty.')).toBeInTheDocument();
});

// 5
test('logout clears token and redirects to /', async () => {
    delete window.location;
    window.location = { href: '' };

    render(<ProfilePage />);
    await screen.findByText('alice');

    fireEvent.click(screen.getByText('Logout'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/');
});