"use client";

import React from "react";
import { useState, useEffect } from "react";

export default function FindParcel() {
    const [parcel, setParcel] = useState("");
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000")
        fetch("http://localhost:3004")
    })

    return (
        <>
        </>
    );
}