ALTER TABLE member_values ADD CONSTRAINT member_values_member_id_question_id_unique UNIQUE (member_id,
                                                                                            question_id);

