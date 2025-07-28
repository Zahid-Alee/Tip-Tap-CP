import { createRoot } from "react-dom/client";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useEffect, useRef, useState } from "react";
import EditorLoader from "./components/tiptap-ui/Loader/EditorLoader";

const getCsrfToken = () => {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute("content") : null;
};

const App = () => {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState({
    loadUrl: null,
    saveUrl: 'null',
    headers: {
      "X-CSRF-TOKEN": getCsrfToken(),
    },
    readOnly: false,
    initialContent: `<header>
  <h1>Cyber security introduction</h1>
  <p>Welcome to the world of cyber security! In this lecture, we'll explore the fundamental concepts that underpin the protection of digital assets. Get ready to learn how to defend against ever-evolving cyber threats and safeguard sensitive information.</p>
</header>

<section>
  <h2>Understanding Cyber security Fundamentals</h2>
  <p>Cyber security is no longer a niche field; it's a critical aspect of modern life. From online banking to social media, almost every activity involves the exchange of digital information. This interconnectedness, while convenient, also creates vulnerabilities that malicious actors can exploit. Therefore, understanding the basics is essential for everyone, not just IT professionals.</p>
  <ul>
    <li><strong>What is Cyber security?</strong> <em>Cyber security</em> encompasses the technologies, processes, and practices designed to protect computer systems, networks, and data from unauthorized access, damage, or theft.</li>
    <li>
      <strong>Why is it Important?</strong>
      <ul>
        <li><strong>Data Breaches:</strong> Cyber attacks can lead to significant data breaches, compromising sensitive information such as personal details, financial records, and intellectual property.</li>
        <li><strong>Financial Loss:</strong> Organizations can suffer substantial financial losses due to downtime, recovery costs, legal fees, and reputational damage.</li>
        <li><strong>Reputational Damage:</strong> A cyber attack can severely damage an organization's reputation, leading to loss of customer trust and business opportunities.</li>
      </ul>
    </li>
    <li>
      <strong>Key Principles of Cyber security:</strong>
      <ul>
        <li><strong>Confidentiality:</strong> Ensuring that sensitive information is accessible only to authorized individuals.</li>
        <li><strong>Integrity:</strong> Maintaining the accuracy and completeness of data, preventing unauthorized modifications.</li>
        <li><strong>Availability:</strong> Guaranteeing that systems and data are accessible to authorized users when needed.</li>
      </ul>
    </li>
  </ul>
  <blockquote>
    Tip: Think of cyber security as a digital lock and key. The "lock" represents the security measures you implement, and the "key" represents the authorized access to your data.
  </blockquote>
  <p>Let's consider a practical example. Imagine a student using a public Wi-Fi network to access their university's online portal. Without proper cyber security measures, a malicious actor could intercept their login credentials and gain unauthorized access to their academic records. This highlights the importance of using secure networks and strong passwords.</p>
</section>

<hr class="section-divider" />

<section>
  <h2>Common Cyber Threats and Vulnerabilities</h2>
  <p>The cyber threat landscape is constantly evolving, with new attack vectors emerging regularly. To effectively defend against these threats, it's crucial to understand the different types of attacks and vulnerabilities that exist.</p>
  <ul>
    <li>
      <strong>Malware:</strong> <em>Malware</em> is a broad term for malicious software designed to harm or disrupt computer systems.
      <ul>
        <li><strong>Viruses:</strong> Self-replicating programs that attach to other files and spread to other systems.</li>
        <li><strong>Worms:</strong> Self-replicating programs that can spread across networks without human intervention.</li>
        <li><strong>Trojans:</strong> Malicious programs disguised as legitimate software.</li>
        <li><strong>Ransomware:</strong> Malware that encrypts a victim's files and demands a ransom for their decryption.</li>
      </ul>
    </li>
    <li><strong>Phishing:</strong> <em>Phishing</em> is a type of social engineering attack where attackers attempt to trick victims into revealing sensitive information, such as usernames, passwords, and credit card details.</li>
    <li><strong>Denial-of-Service (DoS) Attacks:</strong> <em>DoS attacks</em> overwhelm a system or network with traffic, making it unavailable to legitimate users.</li>
    <li><strong>SQL Injection:</strong> An attack that exploits vulnerabilities in database applications to inject malicious SQL code.</li>
    <li><strong>Zero-Day Exploits:</strong> Attacks that exploit vulnerabilities that are unknown to the software vendor and for which no patch is available.</li>
  </ul>
  <blockquote>
    Insight: Staying informed about the latest cyber threats is essential. Regularly read cyber security news and reports to stay ahead of potential attacks.
  </blockquote>
  <p>For example, consider a phishing email that appears to be from a reputable bank. The email might ask you to click on a link and enter your login credentials to verify your account. However, the link leads to a fake website that is designed to steal your information. By being aware of phishing tactics, you can avoid falling victim to this type of attack.</p>
  <p>Another example is a ransomware attack on a hospital. The attackers encrypt the hospital's medical records and demand a ransom payment in exchange for the decryption key. This can disrupt patient care and potentially endanger lives, highlighting the severe consequences of cyber attacks.</p>
</section>

<hr class="section-divider" />

<section>
  <h2>Essential Security Measures and Best Practices</h2>
  <p>Implementing robust security measures is crucial for protecting against cyber threats. Here are some essential security measures and best practices that you should follow:</p>
  <ol>
    <li>
      <strong>Strong Passwords:</strong> Use strong, unique passwords for all your accounts.
      <ul>
        <li>Avoid using easily guessable information, such as your name, birthday, or pet's name.</li>
        <li>Use a combination of uppercase and lowercase letters, numbers, and symbols.</li>
        <li>Consider using a password manager to generate and store your passwords securely.</li>
      </ul>
    </li>
    <li><strong>Multi-Factor Authentication (MFA):</strong> Enable MFA whenever possible to add an extra layer of security to your accounts. <em>MFA</em> requires you to provide two or more forms of authentication, such as a password and a code sent to your mobile device.</li>
    <li><strong>Software Updates:</strong> Keep your software up to date with the latest security patches. Software updates often include fixes for known vulnerabilities that attackers can exploit.</li>
    <li><strong>Firewall:</strong> Use a firewall to block unauthorized access to your network. A <em>firewall</em> acts as a barrier between your network and the outside world, filtering incoming and outgoing traffic.</li>
    <li><strong>Antivirus Software:</strong> Install and regularly update antivirus software to protect against malware. <em>Antivirus software</em> scans your computer for viruses, worms, and other malicious software, and removes them if detected.</li>
    <li><strong>Regular Backups:</strong> Back up your data regularly to protect against data loss in the event of a cyber attack or hardware failure. Store your backups in a secure location, preferably offsite.</li>
    <li><strong>Security Awareness Training:</strong> Educate yourself and your employees about cyber security threats and best practices. Security awareness training can help you identify and avoid phishing scams, malware attacks, and other cyber threats.</li>
  </ol>
  <blockquote>
    Best Practice: Regularly review and update your security measures to ensure they are effective against the latest threats. Cyber security is an ongoing process, not a one-time fix.
  </blockquote>
  <p>For example, consider a small business that doesn't have a dedicated IT security team. By implementing these essential security measures, such as strong passwords, MFA, and regular software updates, the business can significantly reduce its risk of falling victim to a cyber attack.</p>
  <p>Another example is a student who enables MFA on their email account. Even if their password is compromised, an attacker would still need access to their mobile device to gain access to their account. This makes it much more difficult for attackers to steal their personal information.</p>
</section>

<hr class="section-divider" />

<section>
  <h2>The Future of Cyber security and Emerging Trends</h2>
  <p>Cyber security is a constantly evolving field, driven by technological advancements and the ever-changing threat landscape. Understanding emerging trends is crucial for staying ahead of potential attacks and adapting your security strategies accordingly.</p>
  <ul>
    <li><strong>Artificial Intelligence (AI) and Machine Learning (ML):</strong> AI and ML are being used to automate threat detection, analyze large volumes of security data, and respond to incidents more quickly. However, attackers are also using AI and ML to develop more sophisticated attacks.</li>
    <li><strong>Cloud Security:</strong> As more organizations move their data and applications to the cloud, cloud security is becoming increasingly important. This includes securing cloud infrastructure, data, and applications.</li>
    <li><strong>Internet of Things (IoT) Security:</strong> The proliferation of IoT devices, such as smart home devices and industrial sensors, has created new security challenges. IoT devices are often vulnerable to attack due to weak security measures and lack of updates.</li>
    <li><strong>Quantum Computing:</strong> Quantum computing has the potential to break many of the encryption algorithms that are currently used to secure data. This poses a significant threat to cyber security, and researchers are working to develop quantum-resistant encryption algorithms.</li>
    <li><strong>Zero Trust Security:</strong> <em>Zero Trust Security</em> is a security model that assumes that no user or device is trusted by default, even if they are inside the network perimeter. This requires verifying the identity of every user and device before granting access to resources.</li>
  </ul>
  <blockquote>
    Future Outlook: The demand for cyber security professionals is expected to continue to grow in the coming years. If you're interested in a career in cyber security, now is a great time to get started.
  </blockquote>
  <p>For example, consider a company that uses AI-powered security tools to detect and respond to cyber threats. These tools can analyze network traffic, identify suspicious activity, and automatically block malicious attacks. This helps the company to protect its systems and data from sophisticated threats.</p>
  <p>Another example is a government agency that is investing in quantum-resistant encryption algorithms. This will help to protect its sensitive data from future attacks by quantum computers. By staying ahead of emerging trends, the agency can ensure that its data remains secure for years to come.</p>
</section>
<section>
  <h2>AI Code Example: Simple Neural Network with TensorFlow</h2>
  <p>Below is a basic example of how to create and train a simple neural network using TensorFlow and Keras to classify digits from the MNIST dataset:</p>
  <pre><code class="language-python">
import tensorflow as tf
from tensorflow.keras.datasets import mnist
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Flatten
from tensorflow.keras.utils import to_categorical

# Load and preprocess data
(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train = x_train / 255.0
x_test = x_test / 255.0
y_train = to_categorical(y_train)
y_test = to_categorical(y_test)

# Build the model
model = Sequential([
    Flatten(input_shape=(28, 28)),
    Dense(128, activation='relu'),
    Dense(10, activation='softmax')
])

# Compile and train
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(x_train, y_train, epochs=5, validation_data=(x_test, y_test))
  </code></pre>
  <blockquote>
    Note: This is a simplified example. For real-world applications, consider adding dropout, batch normalization, and other optimizations.
  </blockquote>
</section>
<section>
  <h2>Comparison of Popular AI Frameworks</h2>
  <p>The table below compares some of the most widely used frameworks for developing AI applications:</p>

  <table border="1" cellpadding="10" cellspacing="0">
    <thead>
      <tr>
        <th>Framework</th>
        <th>Language</th>
        <th>Best For</th>
        <th>Developer</th>
        <th>Open Source</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>TensorFlow</td>
        <td>Python, C++, JavaScript</td>
        <td>Deep Learning, Production ML</td>
        <td>Google</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td>PyTorch</td>
        <td>Python, C++</td>
        <td>Research, Dynamic Neural Networks</td>
        <td>Meta (Facebook)</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td>Keras</td>
        <td>Python</td>
        <td>User-friendly Neural Networks</td>
        <td>Originally by François Chollet, now part of TensorFlow</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td>Scikit-learn</td>
        <td>Python</td>
        <td>Traditional ML Algorithms</td>
        <td>Community-driven</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td>ONNX</td>
        <td>Multiple</td>
        <td>Model Interoperability</td>
        <td>Microsoft, Facebook</td>
        <td>Yes</td>
      </tr>
    </tbody>
  </table>

  <blockquote>
    Tip: Choose the framework that best fits your project's complexity, deployment needs, and development experience.
  </blockquote>
</section>

`,
    title: "My Text Lecture",
    translations: [],
    editorId: "",
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const editorRef = useRef(null);
  const configReceivedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "EDITOR_CONFIG") {
        setConfig((prevConfig) => ({
          ...prevConfig,
          ...event.data.config,
        }));
        configReceivedRef.current = true;
        event.source.postMessage(
          { type: "EDITOR_CONFIG_RECEIVED" },
          event.origin
        );
      }
    };

    window.addEventListener("message", handleMessage);

    if (window.parent) {
      setTimeout(() => {
        window.parent.postMessage({ type: "EDITOR_READY" }, "*");
      }, 500);
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (isInitialized && editorRef.current && configReceivedRef.current) {
      editorRef.current.setContent(config.initialContent);
    }
  }, [isInitialized, config.initialContent]);

  const handleSaveSuccess = (data) => {
    if (window.parent) {
      window.parent.postMessage({ type: "EDITOR_SAVE_SUCCESS", data }, "*");
    }
  };

  const handleSaveError = (error) => {
    if (window.parent) {
      window.parent.postMessage(
        { type: "EDITOR_SAVE_ERROR", error: error.message },
        "*"
      );
    }
  };

  const handleLoadSuccess = (data) => {
    if (window.parent) {
      window.parent.postMessage({ type: "EDITOR_LOAD_SUCCESS" }, "*");
    }
    setIsInitialized(true);
  };

  const handleLoadError = (error) => {
    if (window.parent) {
      window.parent.postMessage(
        { type: "EDITOR_LOAD_ERROR", error: error.message },
        "*"
      );
    }
  };

  const handleEditorReady = () => {
    setIsInitialized(true);

    if (configReceivedRef.current && editorRef.current) {
      editorRef.current.setContent(config.initialContent);
    }
  };

  console.log("config received", config);

  if (!config.saveUrl) return <EditorLoader />;

  return (
    <SimpleEditor
      ref={editorRef}
      saveUrl={config.saveUrl}
      headers={config.headers}
      onSaveSuccess={handleSaveSuccess}
      onSaveError={handleSaveError}
      onLoadSuccess={handleLoadSuccess}
      onLoadError={handleLoadError}
      initialContent={config.initialContent}
      readOnlyValue={config.readOnly}
      editorId={config.editorId}
      onReady={handleEditorReady}
      title={config.title}
      translations={config.translations}
    />
  );
};

createRoot(document.getElementById("root")).render(<App />);
