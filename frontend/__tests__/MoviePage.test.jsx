import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MoviePage from '../app/movies/[id]/page';

jest.mock('next/navigation', () => ({
    useParams: () => ({id: 'movie123'})
}));

const mockMovie = {
    _id: 'movie123',
    title: 'Inception',
    year: 2010,
    description: 'A mind-bending thriller.',
    poster: 'https://example.com/poster.jpg',
    rating: 8.8,
    director: 'Christopher Nolan',
    genres: ['Sci-Fi', 'Thriller'],
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'],
    reviews: [
        {
            _id: 'review1',
            score: 9,
            text: 'Amazing movie!',
            userId: { _id: 'user1', username: 'alice' }
        }
    ]
};

beforeEach(() => {
    localStorage.clear();

    global.fetch = jest.fn((url) => {
        if (url.includes('/api/movies/movie123/reviews')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        if (url.includes('/api/movies/movie123')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMovie) });
        }
        if (url.includes('/api/users/me')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ user: { _id: 'user1', watched: [], watchlist: [], favorites: [] } })
            });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
});

afterEach(() => {
    jest.clearAllMocks();
});


// 1
test('shows Loading... while fetching', () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    render(<MoviePage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
});

// 2
test('renders movie title and year', async () => {
    render(<MoviePage />);
    await waitFor(() => expect(screen.getByText('Inception')).toBeInTheDocument());
    expect(screen.getByText('2010')).toBeInTheDocument();
});

// 3
test('renders poster with correct alt text', async () => {
    render(<MoviePage />);
    const img = await screen.findByAltText('Inception');
    expect(img).toHaveAttribute('src', 'https://example.com/poster.jpg');
});

// 4
test('displays director and rating', async () => {
    render(<MoviePage />);
    await waitFor(() => expect(screen.getByText(/Christopher Nolan/)).toBeInTheDocument());
    expect(screen.getByText(/8.8/)).toBeInTheDocument();
});

// 5
test('displays genres as tags', async () => {
    render(<MoviePage />);
    await waitFor(() => expect(screen.getByText('Sci-Fi')).toBeInTheDocument());
    expect(screen.getByText('Thriller')).toBeInTheDocument();
});

// 6
test('Write a review button toggles the review form', async () => {
    render(<MoviePage />);
    await screen.findByText('Inception');

    const btn = screen.getByText('Write a review');
    fireEvent.click(btn);
    expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText('Share your thoughts...')).not.toBeInTheDocument();
});

// 7
test('Watched button redirects to /login when not authenticated', async () => {
    delete window.location;
    window.location = { href: '' };

    render(<MoviePage />);
    await screen.findByText('Inception');

    fireEvent.click(screen.getByText('Watched'));
    expect(window.location.href).toBe('/login');
});

// 8
test('shows "Movie not found" when fetch returns null', async () => {
    global.fetch = jest.fn((url) => {
        if (url.includes('/reviews')) {
            return Promise.reject(new Error('not found'));
        }
        return Promise.resolve({ ok: false, json: () => Promise.resolve(null) });
    });
    render(<MoviePage />);
    await waitFor(() => expect(screen.getByText('Movie not found')).toBeInTheDocument());
});

// 9
test('review form submits POST and adds review to the list', async () => {
    localStorage.setItem('token', 'fake-token');

    const newReview = { _id: 'review2', score: 7, text: 'Pretty good film!', userId: { _id: 'user1', username: 'alice' } };
    global.fetch = jest.fn((url, options) => {
        if (options?.method === 'POST') {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(newReview) });
        }
        if (url.includes('/api/movies/movie123/reviews')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        if (url.includes('/api/movies/movie123')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMovie) });
        }
        if (url.includes('/api/users/me')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ user: { _id: 'user1', watched: [], watchlist: [], favorites: [] } }) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<MoviePage />);
    await screen.findByText('Inception');

    fireEvent.click(screen.getByText('Write a review'));
    await userEvent.type(screen.getByPlaceholderText('Share your thoughts...'), 'Pretty good film!');
    fireEvent.click(screen.getByText('Post review'));

    await waitFor(() => expect(screen.getByText('Pretty good film!')).toBeInTheDocument());
});

// 10

test('cast members are displayed separated by commas', async () => {
    render(<MoviePage />);
    await waitFor(() =>
        expect(screen.getByText('Leonardo DiCaprio, Joseph Gordon-Levitt')).toBeInTheDocument()
    );
});