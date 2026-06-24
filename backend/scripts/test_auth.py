"""Quick smoke test for auth + chat history endpoints."""
import asyncio
import httpx


async def main():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        health = await client.get("/api/health")
        print("health:", health.status_code, health.json())

        signup = await client.post(
            "/api/auth/signup",
            json={"email": "smoketest@example.com", "password": "testpass123"},
        )
        print("signup:", signup.status_code, signup.text)
        assert signup.status_code in (201, 409), signup.text

        if signup.status_code == 409:
            login = await client.post(
                "/api/auth/login",
                json={"email": "smoketest@example.com", "password": "testpass123"},
            )
            print("login:", login.status_code, login.text)
            assert login.status_code == 200

        me = await client.get("/api/auth/me")
        print("me:", me.status_code, me.json())

        convs = await client.get("/api/chat/conversations")
        print("conversations:", convs.status_code, convs.json())

        print("OK")


if __name__ == "__main__":
    asyncio.run(main())
