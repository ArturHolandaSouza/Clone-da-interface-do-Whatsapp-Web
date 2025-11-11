import styled from "styled-components";

export const UserMyMessage = styled.span`
    background-color: #D9FDD3;
    padding: 10px;
    border-radius: 5px;
`;

export const UserOtherMessage = styled.div`
    background-color: #fff;
    padding: 10px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
`;

export const UserOtherMessageName = styled.span`
    color: ${({ color }) => '#' + color};
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    &:hover {
        text-decoration-line: underline;
    }
`;

