import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Code,
  Database,
  Server,
  ChevronLeft,
  ChevronRight,
  Shield,
  BookOpen,
  Target,
  Rocket,
  Users,
  CheckCircle,
  Layers,
  Cpu,
  Network,
  Quote,
  Linkedin,
  Twitter,
  Github,
  Mail,
  Menu,
  X,
} from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [activeSubject, setActiveSubject] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const subjects = [
    {
      icon: <Cpu color="#6366f1" />,
      title: "C++ Programming",
      description:
        "Deep dive into Object-Oriented Programming concepts and advanced techniques.",
      topics: ["Class Design", "Templates", "STL", "Memory Management"],
      difficulty: "Advanced",
      color: "#6366f1",
    },
    {
      icon: <Layers color="#10b981" />,
      title: "Database Management",
      description:
        "Comprehensive DBMS knowledge with practical implementation strategies.",
      topics: ["SQL", "Normalization", "Query Optimization", "Database Design"],
      difficulty: "Intermediate",
      color: "#10b981",
    },
    {
      icon: <Network color="#ef4444" />,
      title: "Operating Systems",
      description:
        "Fundamental and advanced operating systems concepts and architectures.",
      topics: [
        "Process Management",
        "Memory Allocation",
        "File Systems",
        "Concurrency",
      ],
      difficulty: "Advanced",
      color: "#ef4444",
    },
  ];

  const testimonials = [
    {
      name: "John Doe",
      role: "Senior Software Engineer",
      company: "TechCorp Solutions",
      quote:
        "InterviewPrep revolutionized my technical interview preparation with its structured and comprehensive approach.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
      background: "#6366f1",
    },
    {
      name: "Jane Smith",
      role: "Data Science Lead",
      company: "Analytics Innovations",
      quote:
        "The platform's adaptive learning and detailed analytics helped me crack interviews at top-tier tech companies.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
      background: "#10b981",
    },
    {
      name: "Mike Johnson",
      role: "Cloud Architect",
      company: "CloudNative Inc.",
      quote:
        "Personalized learning paths and real-world problem sets made my interview preparation systematic and effective.",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      rating: 4,
      background: "#ef4444",
    },
  ];

  const features = [
    {
      icon: <BookOpen color="#6366f1" size={48} />,
      title: "Comprehensive Content",
      description:
        "Extensive coverage of technical topics with in-depth learning modules and real-world interview questions.",
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      icon: <Target color="#10b981" size={48} />,
      title: "Targeted Practice",
      description:
        "AI-powered practice sessions that adapt to your skill level and focus on your weak areas.",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: <Rocket color="#f59e0b" size={48} />,
      title: "Career Acceleration",
      description:
        "Strategic guidance and mock interviews to help you stand out in competitive technical interviews.",
      gradient: "from-amber-500 to-orange-600",
    },
  ];
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? "filled" : ""}`}>
        ★
      </span>
    ));
  };

  const nextSubject = () => {
    setActiveSubject((prev) => (prev + 1) % subjects.length);
  };

  const prevSubject = () => {
    setActiveSubject((prev) => (prev === 0 ? subjects.length - 1 : prev - 1));
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <div
        className="scroll-progress"
        style={{
          width: `${scrollProgress}%`,
          position: "fixed",
          top: 0,
          left: 0,
          height: "4px",
          backgroundColor: "#6366f1",
          zIndex: 1000,
        }}
      />

      {/* Header */}
      <header className="enhanced-header">
        <div className="header-container">
          <div className="logo-section">
            <Link to="/" className="logo-link">
              <Shield color="#6366f1" size={32} />
              <span className="logo-text">InterviewPrep</span>
            </Link>
          </div>

          <nav
            className={`main-navigation ${
              isMenuOpen ? "mobile-menu-open" : ""
            }`}
          >
            <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </div>

            <ul className="nav-menu">
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#subjects">Subjects</a>
              </li>
              <li>
                <a href="#testimonials">Testimonials</a>
              </li>
              <li>
                <a href="/pricing">Pricing</a>
              </li>
            </ul>

            <div className="nav-actions">
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/register" className="register-btn">
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1>Elevate Your Technical Interview Preparation</h1>
        <p>
          Intelligent, adaptive learning platform designed to transform your
          interview readiness across multiple technical domains.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="primary-btn">
            Start Your Journey
          </Link>
          <Link to="/demo" className="secondary-btn">
            Watch Demo
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose InterviewPrep?</h2>
          <p className="section-subtitle">
            Our platform is designed by tech experts to give you the competitive edge
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card bg-gradient-to-br ${feature.gradient}`}
            >
              <div className="feature-icon-container">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-hover-effect"></div>
            </div>
          ))}
        </div>
      </section>

      <section className="subjects-section">
        <div className="subjects-header">
          <h2>Explore Interview Domains</h2>
          <p>
            Targeted learning paths for comprehensive technical interview
            preparation
          </p>
        </div>
        <div className="subjects-carousel-container">
          <div className="subjects-navigation">
            <button onClick={prevSubject} className="nav-button prev">
              <ChevronLeft />
            </button>
            <div className="subject-card-wrapper">
              <div
                className="subject-card"
                style={{
                  borderColor: subjects[activeSubject].color,
                  boxShadow: `0 10px 25px rgba(${parseInt(
                    subjects[activeSubject].color.slice(1, 3),
                    16
                  )}, ${parseInt(
                    subjects[activeSubject].color.slice(3, 5),
                    16
                  )}, ${parseInt(
                    subjects[activeSubject].color.slice(5, 7),
                    16
                  )}, 0.2)`,
                }}
              >
                <div className="subject-card-header">
                  {React.cloneElement(subjects[activeSubject].icon, {
                    size: 48,
                    color: subjects[activeSubject].color,
                  })}
                </div>
                <h3>{subjects[activeSubject].title}</h3>
                <p>{subjects[activeSubject].description}</p>
                <div className="subject-topics">
                  {subjects[activeSubject].topics.map((topic, index) => (
                    <span
                      key={index}
                      className="topic-tag"
                      style={{
                        backgroundColor: `${subjects[activeSubject].color}20`,
                        color: subjects[activeSubject].color,
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={nextSubject} className="nav-button next">
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-header">
          <h2>Success Stories</h2>
          <p>
            Real experiences from professionals who transformed their interview
            preparation
          </p>
        </div>
        <div className="testimonials-carousel-container">
          <div className="testimonials-navigation">
            <button onClick={prevTestimonial} className="nav-button prev">
              <ChevronLeft />
            </button>
            <div className="testimonial-card-wrapper">
              <div
                className="testimonial-card"
                style={{
                  backgroundColor: testimonials[activeTestimonial].background,
                  color: "white",
                }}
              >
                <div className="testimonial-card-header">
                  <div className="testimonial-avatar-container">
                    <img
                      src={testimonials[activeTestimonial].avatar}
                      alt={testimonials[activeTestimonial].name}
                      className="testimonial-avatar"
                    />
                    <div className="testimonial-rating">
                      {renderStars(testimonials[activeTestimonial].rating)}
                    </div>
                  </div>
                  <Quote size={40} color="rgba(255,255,255,0.2)" />
                </div>
                <p className="testimonial-quote">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="testimonial-author">
                  <h4>{testimonials[activeTestimonial].name}</h4>
                  <p>
                    {testimonials[activeTestimonial].role} @{" "}
                    {testimonials[activeTestimonial].company}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={nextTestimonial} className="nav-button next">
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="enhanced-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <Shield color="#6366f1" size={40} />
                <span>InterviewPrep</span>
              </div>
              <p className="footer-tagline">
                Empowering tech professionals to ace their interviews with
                intelligent, adaptive learning.
              </p>
            </div>

            <div className="footer-links-section">
              <div className="footer-column">
                <h4>Product</h4>
                <ul>
                  <li>
                    <a href="/features">Features</a>
                  </li>
                  <li>
                    <a href="/pricing">Pricing</a>
                  </li>
                  <li>
                    <a href="/subjects">Subjects</a>
                  </li>
                  <li>
                    <a href="/roadmap">Roadmap</a>
                  </li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <ul>
                  <li>
                    <a href="/about">About Us</a>
                  </li>
                  <li>
                    <a href="/careers">Careers</a>
                  </li>
                  <li>
                    <a href="/contact">Contact</a>
                  </li>
                  <li>
                    <a href="/press">Press</a>
                  </li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <ul>
                  <li>
                    <a href="/terms">Terms of Service</a>
                  </li>
                  <li>
                    <a href="/privacy">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="/cookies">Cookie Policy</a>
                  </li>
                  <li>
                    <a href="/security">Security</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="footer-newsletter">
              <h4>Stay Updated</h4>
              <p>
                Subscribe to our newsletter for interview tips and platform
                updates.
              </p>
              <div className="newsletter-signup">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
                <button className="newsletter-submit">Subscribe</button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              © {new Date().getFullYear()} InterviewPrep. All rights reserved.
            </div>
            <div className="footer-social-links">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github />
              </a>
              <a href="mailto:contact@interviewprep.com">
                <Mail />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
