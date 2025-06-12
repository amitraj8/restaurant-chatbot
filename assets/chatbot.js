document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const chatToggleButton = document.getElementById('chat-toggle-button');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChatButton = document.getElementById('close-chat-button');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Chatbot state variables
    let chatHistory = []; // Stores the conversation history for the LLM

    // --- Event Listeners ---

    // Toggle chat window visibility
    chatToggleButton.addEventListener('click', () => {
        chatbotContainer.style.display = chatbotContainer.style.display === 'flex' ? 'none' : 'flex';
        // Scroll to the bottom when opening
        if (chatbotContainer.style.display === 'flex') {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });

    // Close chat window
    closeChatButton.addEventListener('click', () => {
        chatbotContainer.style.display = 'none';
    });

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key press in input field
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent new line in textarea
            sendMessage();
        }
    });

    // --- Chatbot Core Functions ---

    /**
     * Sends the user's message to the chat and then to the LLM.
     */
    async function sendMessage() {
        const messageText = userInput.value.trim();
        if (messageText === '') return; // Don't send empty messages

        // Display user message in the chat window
        displayMessage(messageText, 'user');

        // Add user message to chat history
        chatHistory.push({ role: 'user', parts: [{ text: messageText }] });

        // Clear input field
        userInput.value = '';
        userInput.disabled = true; // Disable input while waiting for bot
        sendButton.disabled = true; // Disable send button

        // Simulate typing indicator or show a loading message
        const loadingMessageDiv = displayMessage('Bot is typing...', 'bot loading');
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to new message

        try {
            // Call the Gemini API
            const botResponse = await getBotResponse(messageText);

            // Remove loading indicator
            loadingMessageDiv.remove();

            // Display bot's response
            displayMessage(botResponse, 'bot');

            // Add bot response to chat history
            chatHistory.push({ role: 'model', parts: [{ text: botResponse }] });

        } catch (error) {
            console.error('Error getting bot response:', error);
            // Remove loading indicator
            loadingMessageDiv.remove();
            displayMessage('Oops! Something went wrong. Please try again.', 'bot error');
        } finally {
            userInput.disabled = false; // Re-enable input
            sendButton.disabled = false; // Re-enable send button
            userInput.focus(); // Focus input for next message
            chatMessages.scrollTop = chatMessages.scrollHeight; // Ensure scrolled to bottom
        }
    }

    /**
     * Displays a message in the chat window.
     * @param {string} text - The message text.
     * @param {string} sender - 'user' or 'bot'.
     * @returns {HTMLElement} The created message div.
     */
    function displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text; // Use textContent for security and plain text
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
        return messageDiv;
    }

    /**
     * Calls the Google Gemini API to get a chatbot response.
     * @param {string} userQuery - The user's message.
     * @returns {Promise<string>} The bot's response.
     */
    async function getBotResponse(userQuery) {
        // IMPORTANT: In the Canvas environment, leave apiKey as an empty string.
        // Canvas will automatically inject the necessary API key at runtime.
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Create the payload for the API request
        const payload = {
            contents: chatHistory
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
            }

            const result = await response.json();

            // Check if the response structure is as expected
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text;
            } else {
                console.warn('Unexpected API response structure:', result);
                return "I'm sorry, I couldn't generate a response. The API returned an unexpected format.";
            }

        } catch (error) {
            console.error('Error fetching from Gemini API:', error);
            throw error; // Re-throw to be caught by sendMessage's try/catch
        }
    }

    // Optional: Add a welcoming message when the page loads or chatbot is opened
    // displayMessage('Hello! How can I help you with your Indian Flavours dining experience today?', 'bot');
});
