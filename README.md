# Job Tracker with Bookmarklet Autofill

A simple job tracking web app that lets you save job listings directly from job sites using a bookmarklet.

## Overview

This project helps you track job applications without manually copying details. With one click, you can capture job information from sites like LinkedIn or Indeed and save it to your personal dashboard.

## Features

* One-click job saving using a bookmarklet
* Automatically captures job title, company, and link
* Dashboard to view and manage saved jobs
* Simple and clean UI for tracking applications

## How It Works

1. Open a job listing (LinkedIn, Indeed, etc.)
2. Click the bookmarklet
3. The tool scrapes the job details
4. Data is saved to your database
5. View and manage jobs in the dashboard

## Tech Stack

* Next.js
* Supabase (database & API)
* JavaScript (bookmarklet scraping)
* SCSS for styling

## Why I Built This

Manually tracking job applications is repetitive and time-consuming. This project simplifies the process by automating data capture and organizing everything in one place.

## Current Status

MVP is complete:

* Bookmarklet scraping works
* Data saving is functional
* Dashboard displays saved jobs

## Future Improvements

* Chrome extension version for better reliability
* Improved scraping for more job platforms
* Job status tracking (Applied, Interview, Rejected)
* Better UI/UX enhancements

## Getting Started

Clone the repository and install dependencies:

npm install

Run the development server:

npm run dev

## Notes

Some job sites may not work perfectly due to DOM structure differences or security restrictions. The scraper is designed to be flexible but may need adjustments per site.


