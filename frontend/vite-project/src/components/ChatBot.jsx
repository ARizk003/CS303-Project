import { useState, useEffect, useRef } from 'react';

const GROQ_API_KEY = 'key';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your Library Assistant. I can help you find books, summarize them, and answer your questions!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetch('http://localhost:5000/api/books')
            .then(res => res.json())
            .then(data => setBooks(data))
            .catch(() => {});
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const booksContext = books.length > 0
                ? `Available books:\n${books.map(b => `- "${b.title}" by ${b.author}`).join('\n')}`
                : 'No books available currently.';

            const systemPrompt = {
    role: 'system',
    content: `You are a helpful library assistant. ${booksContext} 
    Respond in the same language the user uses (Arabic or English). 
    If the user speaks Arabic, reply in professional and friendly Arabic.`
};

            const cleanedHistory = messages.map(({ role, content }) => ({ role, content }));

            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        systemPrompt,
                        ...cleanedHistory,
                        userMessage
                    ],
                    max_tokens: 500
                })
            });

            const data = await res.json();

            if (res.ok) {
                const reply = data.choices?.[0]?.message?.content || 'Empty response';
                setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error?.message || 'Failed'}` }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
            {isOpen && (
                <div style={{
                    width: '350px', height: '500px', backgroundColor: 'white',
                    borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column', marginBottom: '10px'
                }}>
                    <div style={{ backgroundColor: '#002147', color: 'white', padding: '15px', borderRadius: '12px 12px 0 0' }}>
                        <h6 style={{ margin: 0 }}>📚 Library Assistant</h6>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.role === 'user' ? '#002147' : '#f0f0f0',
                                color: msg.role === 'user' ? 'white' : 'black',
                                padding: '8px 12px', borderRadius: '12px', maxWidth: '80%', fontSize: '14px',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {msg.content}
                            </div>
                        ))}
                        {loading && <div style={{ alignSelf: 'flex-start', color: '#999', fontSize: '13px' }}>Typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
                        <input
                            style={{ flex: 1, padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                        />
                        <button 
                            onClick={sendMessage}
                            style={{ backgroundColor: '#C5A059', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '55px', height: '55px', borderRadius: '50%',
                    backgroundColor: '#002147', border: 'none', color: 'white',
                    fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};

export default ChatBot;